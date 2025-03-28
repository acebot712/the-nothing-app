# Production Deployment Guide

This document provides instructions for deploying The Nothing App to production environments.

## Pre-Deployment Checklis

Before deploying to production, ensure you have completed the following tasks:

- [ ] Run `npm run lint:all` to check for linting errors
- [ ] Run `npm run tsc` to verify TypeScript types
- [ ] Verify all environment variables are correctly set for production
- [ ] Test the application in a staging environmen
- [ ] Ensure Supabase is properly configured with all required tables
- [ ] Verify Stripe integration is working correctly
- [ ] Check that all API endpoints are secured
- [ ] Run a complete test of the user flow from registration to paymen
- [ ] Execute `npm run preproduction` to perform automated pre-production checks

## Environment Configuration

The app requires the following environment variables for production:

```
EXPO_PUBLIC_SUPABASE_URL=your-production-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-production-supabase-anon-key
EXPO_PUBLIC_API_URL=https://your-production-api-url.com/api
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-production-stripe-publishable-key
```

### Setting Environment Variables for Expo

1. For local testing with production settings, create a `.env.production` file:

```
EXPO_PUBLIC_SUPABASE_URL=your-production-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-production-supabase-anon-key
EXPO_PUBLIC_API_URL=https://your-production-api-url.com/api
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-production-stripe-publishable-key
APP_ENVIRONMENT=production
```

2. For EAS builds, these variables are configured in the `eas.json` file:

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "your-production-supabase-url",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your-production-supabase-anon-key",
        "EXPO_PUBLIC_API_URL": "https://your-production-api-url.com/api",
        "EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY": "your-production-stripe-publishable-key",
        "APP_ENVIRONMENT": "production"
      }
    }
  }
}
```

3. For secure environment variables, use EAS Secrets:

```bash
# Set secrets via EAS CLI
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your-anon-key"
eas secret:create --scope project --name EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY --value "your-stripe-key"
```

## Database Configuration

Ensure your Supabase production database:

1. Has all the required tables created (use `supabase-schema.sql`)
2. Has appropriate Row Level Security (RLS) policies to protect user data
3. Has backups enabled
4. Has database migrations applied if you've made schema changes

## API Server Deploymen

Deploy the server component:

1. Set up a Node.js environment on your hosting provider (AWS, GCP, Azure, etc.)
2. Configure server environment variables for production
3. Set up SSL/TLS certificates for secure connections
4. Implement rate limiting for API endpoints
5. Set up continuous monitoring and error tracking

### Example server environment variables:

```
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://your-app-domain.com
SUPABASE_URL=your-production-supabase-url
SUPABASE_SERVICE_KEY=your-supabase-service-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secre
```

## Building for Production

### Using the CI Build Scrip

The easiest way to build for production is using our CI build script:

```bash
# Build for iOS production
./scripts/ci-build.sh -e production -p ios -u

# Build for Android production
./scripts/ci-build.sh -e production -p android -u

# Build for both platforms
./scripts/ci-build.sh -e production -p all -u
```

### Manual Building

Alternatively, you can use the npm scripts directly:

#### iOS

```bash
# Build for iOS App Store
npm run build:ios
```

After building, follow these steps:
1. Download the build from EAS
2. Submit to App Store Connect using `npm run submit:ios` or manually through Xcode
3. Complete App Store submission requirements (screenshots, descriptions, etc.)

#### Android

```bash
# Build for Google Play Store
npm run build:android
```

After building, follow these steps:
1. Download the build from EAS
2. Submit to Google Play using `npm run submit:android` or manually through Google Play Console
3. Complete Play Store submission requirements (screenshots, descriptions, etc.)

## Progressive Rollou

For major updates, consider using a phased rollout:

1. Release to 10% of users initially
2. Monitor for errors and crashes
3. If no issues are found, gradually increase the rollout percentage
4. Complete the rollout once stability is confirmed

## Monitoring and Analytics

Set up the following for production monitoring:

1. Error tracking (Sentry recommended)
2. Performance monitoring
3. User analytics
4. Server logs and alerting

## Database Migration Plan

When making schema changes in production:

1. Always back up the database before migrations
2. Test migrations on a staging environment firs
3. Schedule migrations during off-peak hours
4. Have a rollback plan in case of issues

## Scaling Considerations

As user base grows:

1. Consider implementing a CDN for static assets
2. Set up database read replicas for heavy read operations
3. Implement caching for frequently accessed data
4. Scale API servers horizontally as needed

## Security Considerations

1. Enable audit logs in Supabase
2. Implement IP-based rate limiting for sensitive endpoints
3. Regularly rotate API keys and credentials
4. Set up security monitoring and alerting
5. Perform regular security audits

## Troubleshooting Common Production Issues

### Database Connection Issues

If users report database connection errors:
1. Check Supabase status page
2. Verify network connectivity between app and Supabase
3. Confirm environment variables are correctly se
4. Check for database service disruptions
5. Verify the application is using the fallback mechanism for database connection issues

### Payment Processing Problems

If payment issues occur:
1. Check Stripe Dashboard for error logs
2. Verify webhook configurations
3. Test payment flow in Stripe test mode
4. Ensure API server is correctly processing Stripe events

## Emergency Contacts

Maintain a list of emergency contacts for production issues:
- DevOps lead: [contact info]
- Backend developer: [contact info]
- Frontend developer: [contact info]
- Database administrator: [contact info]

## Compliance and Legal

Ensure your deployment complies with:
- App Store Review Guidelines
- Google Play Policy
- Data protection regulations (GDPR, CCPA, etc.)
- Payment processing regulations

---

## Reference

For more information on CI/CD pipelines and automated deployments, refer to the CI-CD-SETUP.md document in the docs/infra directory.
