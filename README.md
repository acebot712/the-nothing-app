# The Nothing App

A React Native application that sells you absolutely nothing, for real money. This project demonstrates a modern mobile application with payment processing, user management, and a leaderboard system.

## Project Structure

The application is organized as follows:
- Main React Native application in the root directory (containing App.tsx)
- Components, screens and contexts in `app/` directory
- Backend utilities in `server/` directory

## Frontend (React Native with Expo)

The frontend is built with React Native and Expo, featuring:

- User registration and login
- Multiple pricing tiers
- Stripe payment integration
- User dashboard
- Global leaderboard

## Backend (Node.js/Express)

The backend provides a REST API that handles:

- User management
- Payment processing with Stripe
- Leaderboard functionality
- Database operations using Supabase

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- Expo CLI
- Supabase account
- Stripe account (for payment processing)

### Setup

1. Clone the repository

2. Install dependencies for the project:

```bash
# Install dependencies for the main app
npm install

# Install dependencies for the server
cd server
npm install
cd ..
```

3. Configure environment variables:
   - Create a `.env` file in the `app/` directory using `app/.env.example` as a template
   - Make sure it contains the following variables:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   EXPO_PUBLIC_API_URL=http://localhost:3000/api
   EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
   ```
   - Create a `.env` file in the `server/` directory with the appropriate configuration

4. Set up the database:
   - Either execute the SQL in `supabase-setup.sql` directly in the Supabase SQL Editor
   - Or use the initialization script to create tables and sample data:

```bash
cd server
npm run db:init
```

   **Note on database structure**: The `leaderboard` table uses the `id` column as a foreign key reference to the `users` table. Each user can have one entry in the leaderboard.

5. Start the server in a separate terminal:

```bash
cd server
npm run dev
```

6. Start the application:

```bash
# In the root directory
npx expo start
```

### Troubleshooting

If you encounter the error `ConfigError: The expected package.json path does not exist`, make sure you're running the command from the root directory of the project, not from the `app/` subdirectory.

If you see the error `Supabase credentials are missing. Please check your environment variables.`, ensure:

1. You've created the `.env` file in the `app/` directory with the correct Supabase credentials
2. You've restarted your Metro bundler (close and restart with `npx expo start`)
3. If needed, run `npx expo start --clear` to clear the cache

## Production Deployment

See the [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md) file for detailed instructions on deploying to production environments.

## Supabase Configuration

See the [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) file for detailed instructions on setting up and configuring Supabase.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 