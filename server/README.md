# The Nothing App - Backend Server

This is the backend server for "The Nothing App", providing API endpoints for user management, payment processing, and leaderboard functionality.

## Technology Stack

- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **Supabase** - Database and authentication
- **Stripe** - Payment processing
- **Winston** - Logging

## Getting Started

### Prerequisites

- Node.js 14+ and npm
- Supabase account with a project set up
- Stripe account (for testing payment functionality)

### Installation

1. Clone the repository
2. Navigate to the server directory:
   ```
   cd server
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your Supabase URL, service key, and anon key
   - Fill in your Stripe API keys

### Database Setup

The server will automatically check for required tables and create them if they don't exist. Make sure your Supabase project has the following tables:

1. **users** - Stores user information
2. **leaderboard** - Stores leaderboard rankings

### Running the Server

For development:
```
npm run dev
```

For production:
```
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Log in a user

### Users

- `GET /api/users/:userId` - Get user by ID
- `PUT /api/users/:userId` - Update user information
- `PUT /api/users/:userId/tier` - Update user tier

### Payments

- `POST /api/payments/create-intent` - Create a payment intent
- `POST /api/payments/verify/:paymentIntentId` - Verify a payment
- `POST /api/payments/webhook` - Stripe webhook endpoint

### Leaderboard

- `GET /api/leaderboard` - Get the leaderboard (with pagination)
- `GET /api/leaderboard/user/:userId` - Get a specific user's leaderboard entry

## Environment Variables

| Variable | Description |
|----------|-------------|
| PORT | The port the server runs on |
| NODE_ENV | Environment (development/production) |
| SUPABASE_URL | Your Supabase project URL |
| SUPABASE_SERVICE_KEY | Supabase service key (admin access) |
| SUPABASE_ANON_KEY | Supabase anon key (public access) |
| STRIPE_SECRET_KEY | Stripe secret API key |
| STRIPE_PUBLISHABLE_KEY | Stripe publishable API key |
| STRIPE_WEBHOOK_SECRET | Stripe webhook signing secret |
| JWT_SECRET | Secret for JWT signing |
| JWT_EXPIRES_IN | JWT expiration time |
| LOG_LEVEL | Winston logging level |

## Integration with The Nothing App Frontend

Update your frontend to use these API endpoints instead of directly interacting with Supabase. This will provide better validation, error handling, and business logic.

### Example Integration

```javascript
// Frontend code example
const purchaseTier = async (tier) => {
  try {
    // 1. Create payment intent
    const response = await fetch('http://localhost:3000/api/payments/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        tier,
        userId: currentUser.id,
        email: currentUser.email,
        username: currentUser.username
      })
    });
    
    const { data } = await response.json();
    
    // 2. Process payment with Stripe.js
    // ... payment processing with Stripe Elements ...
    
    // 3. Verify payment and update user tier
    const verifyResponse = await fetch(`http://localhost:3000/api/payments/verify/${data.paymentIntentId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id })
    });
    
    const { data: verifyData } = await verifyResponse.json();
    
    return verifyData;
  } catch (error) {
    console.error('Payment error:', error);
    throw error;
  }
};
``` 