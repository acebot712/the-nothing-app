require('dotenv').config();

const config = {
  // Server configuration
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  },
  
  // Supabase configuration
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_KEY,
  },
  
  // Stripe configuration
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    products: {
      basic: {
        price: 100, // $1.00 in cents
        currency: 'usd',
        description: 'Basic tier - Limited features',
      },
      premium: {
        price: 999, // $9.99 in cents 
        currency: 'usd',
        description: 'Premium tier - All features',
      },
      nothing: {
        price: 9999, // $99.99 in cents
        currency: 'usd',
        description: 'Nothing tier - Ultimate edition',
      },
    },
  },
  
  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
  
  // JWT configuration for authentication
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-for-development-only',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
};

// Validate required configuration
const validateConfig = () => {
  const requiredVars = [
    'supabase.url',
    'supabase.anonKey',
    'supabase.serviceKey',
    'stripe.secretKey',
    'stripe.publishableKey',
  ];
  
  const missingVars = [];
  
  for (const varPath of requiredVars) {
    const parts = varPath.split('.');
    let value = config;
    
    for (const part of parts) {
      value = value[part];
      if (value === undefined) {
        missingVars.push(varPath);
        break;
      }
    }
  }
  
  if (missingVars.length > 0) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    } else {
      console.warn(`[WARNING] Missing recommended environment variables: ${missingVars.join(', ')}`);
    }
  }
};

// Only validate in initialization, not on import
if (require.main === module) {
  validateConfig();
}

module.exports = config; 