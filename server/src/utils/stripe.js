const Stripe = require('stripe');
const config = require('../config');
const { logger } = require('./logger');

// Initialize Stripe with secret key
const stripe = new Stripe(config.stripe.secretKey);

// Create a payment intent for a specified tier
const createPaymentIntent = async (tier, metadata = {}) => {
  try {
    // Get tier configuration
    const tierConfig = config.stripe.products[tier.toLowerCase()];
    
    if (!tierConfig) {
      throw new Error(`Invalid tier: ${tier}`);
    }
    
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: tierConfig.price,
      currency: tierConfig.currency,
      metadata: {
        tier: tier.toLowerCase(),
        ...metadata
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    logger.info(`Payment intent created for tier ${tier}: ${paymentIntent.id}`);
    
    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: tierConfig.price,
      currency: tierConfig.currency
    };
  } catch (error) {
    logger.error(`Error creating payment intent: ${error.message}`);
    throw error;
  }
};

// Verify payment intent was successful
const verifyPaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return {
        verified: false,
        status: paymentIntent.status,
        message: `Payment has not succeeded. Current status: ${paymentIntent.status}`
      };
    }
    
    return {
      verified: true,
      status: 'succeeded',
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      metadata: paymentIntent.metadata
    };
  } catch (error) {
    logger.error(`Error verifying payment intent: ${error.message}`);
    return {
      verified: false,
      status: 'error',
      message: error.message
    };
  }
};

// Handle Stripe webhook events
const handleWebhookEvent = async (signature, rawBody) => {
  try {
    const event = stripe.webhooks.constructEvent(
      rawBody, 
      signature, 
      config.stripe.webhookSecret
    );
    
    logger.info(`Webhook received: ${event.type}`);
    
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        
        // Process successful payment
        logger.info(`Payment succeeded: ${paymentIntent.id}`);
        
        // In a production app, you would update the database here
        return { 
          success: true, 
          event: event.type,
          paymentIntentId: paymentIntent.id
        };
        
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        
        // Handle failed payment
        logger.warn(`Payment failed: ${failedPayment.id}`);
        return { 
          success: false, 
          event: event.type,
          paymentIntentId: failedPayment.id,
          error: failedPayment.last_payment_error?.message || 'Payment failed'
        };
        
      default:
        // Handle other event types as needed
        return { 
          success: true, 
          event: event.type
        };
    }
  } catch (error) {
    logger.error(`Webhook error: ${error.message}`);
    throw error;
  }
};

module.exports = {
  stripe,
  createPaymentIntent,
  verifyPaymentIntent,
  handleWebhookEvent
}; 