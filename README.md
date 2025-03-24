# The Nothing App

A React Native application that sells you absolutely nothing, for real money. This project demonstrates a modern mobile application with payment processing, user management, and a leaderboard system.

## Project Structure

- **app/** - React Native frontend application
- **server/** - Node.js Express backend API

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
2. Install dependencies for both frontend and backend:

```bash
# Frontend
cd app
npm install

# Backend
cd server
npm install
```

3. Configure environment variables:
   - Copy `.env.example` to `.env` in both `app/` and `server/` directories
   - Fill in the required values for Supabase and Stripe

4. Initialize the database:

```bash
cd server
npm run db:init
```

5. Start the backend server:

```bash
cd server
npm run dev
```

6. Start the frontend:

```bash
cd app
npx expo start
```

## Production Deployment

### Backend

1. Set up a Node.js hosting environment (e.g., Heroku, Vercel, AWS)
2. Configure environment variables for production
3. Deploy the server code

```bash
npm start
```

### Frontend

1. Build the app for production:

```bash
npx expo build:android  # for Android
npx expo build:ios      # for iOS
```

2. Submit to app stores or distribute through Expo's services

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 