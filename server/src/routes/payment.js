const express = require("express");
const { ApiError } = require("../middleware/errorHandler");
const {
  createPaymentIntent,
  verifyPaymentIntent,
  handleWebhookEvent,
} = require("../utils/stripe");
const userService = require("../services/userService");
const { logger } = require("../utils/logger");
const router = express.Router();

/**
 * @route   POST /api/payments/create-intent
 * @desc    Create a payment intent for a specified tier
 */
router.post("/create-intent", async (req, res, next) => {
  try {
    const { tier, userId, email, username } = req.body;

    if (!tier) {
      throw new ApiError("Tier is required", 400);
    }

    // Create metadata for the payment
    const metadata = { userId };
    if (email) metadata.email = email;
    if (username) metadata.username = username;

    // Create payment intent
    const paymentData = await createPaymentIntent(tier, metadata);

    res.status(200).json({
      status: "success",
      data: paymentData,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/payments/verify/:paymentIntentId
 * @desc    Verify a payment intent and update user tier if successful
 */
router.post("/verify/:paymentIntentId", async (req, res, next) => {
  try {
    const { paymentIntentId } = req.params;
    const { userId } = req.body;

    if (!paymentIntentId) {
      throw new ApiError("Payment intent ID is required", 400);
    }

    if (!userId) {
      throw new ApiError("User ID is required", 400);
    }

    // Verify the payment intent
    const verificationResult = await verifyPaymentIntent(paymentIntentId);

    if (!verificationResult.verified) {
      return res.status(400).json({
        status: "error",
        message: verificationResult.message || "Payment verification failed",
        data: {
          status: verificationResult.status,
        },
      });
    }

    // Get the tier from the payment metadata
    const tier = verificationResult.metadata?.tier || "basic";

    // Update user tier
    const { user } = await userService.updateUserTier(userId, {
      tier,
      paymentId: paymentIntentId,
      amount: verificationResult.amount,
      currency: verificationResult.currency,
    });

    res.status(200).json({
      status: "success",
      data: {
        userId: user.id,
        tier: user.tier,
        verified: true,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/payments/webhook
 * @desc    Handle Stripe webhook events
 * @access  Public (Stripe needs to be able to access this)
 */
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      // Get the signature from the header
      const signature = req.headers["stripe-signature"];

      if (!signature) {
        logger.warn("Webhook request missing signature");
        return res.status(400).json({
          status: "error",
          message: "Missing Stripe signature",
        });
      }

      // Process the webhook event
      const event = await handleWebhookEvent(signature, req.body);

      // Return success to Stripe
      res.status(200).json({ received: true, event: event.event });

      // If this was a successful payment, update the user's tier
      if (
        event.success &&
        event.event === "payment_intent.succeeded" &&
        event.paymentIntentId
      ) {
        try {
          // We would typically get the Stripe payment intent, extract user ID and tier,
          // and then update the user. This is simplified for this example.
          logger.info(
            `Webhook: Processing successful payment ${event.paymentIntentId}`,
          );

          // In a real implementation, you'd verify the payment and update the user
          // For now, we'll log it
          logger.info(
            `Webhook: Would update user for payment ${event.paymentIntentId}`,
          );
        } catch (processingError) {
          logger.error(
            `Error processing webhook payment: ${processingError.message}`,
          );
        }
      }
    } catch (error) {
      logger.error(`Webhook error: ${error.message}`);
      return res.status(400).json({
        status: "error",
        message: error.message,
      });
    }
  },
);

module.exports = router;
