# The Nothing App

A luxury mobile application that does absolutely nothing but lets you flex your wealth.

## About

The Nothing App is a premium, invite-only mobile application designed for the truly wealthy. For just $999 (or more, if you want to flex harder), you can purchase access to an app that literally does nothing functional - except allow you to flex on poor people.

### Features

- **Exclusive Invite System**: The app creates fake exclusivity with an invite code system
- **Net Worth Verification**: "Verify" your wealth ($1M minimum) to proceed
- **Luxury Tiers**:
  - Regular: $999 - For those who merely want to flaunt their wealth
  - Elite: $9,999 - For the seriously wealthy who demand recognition
  - God Mode: $99,999 - For the ultra-wealthy who can afford to waste money
- **Leaderboard**: See who has wasted the most money on nothing
- **Digital Flex Badge**: Share your purchase on social media
- **AI Concierge**: God Mode users receive a luxury concierge message
- **Secret Features**: Hidden functionality for the truly elite

## Technical Stack

- **Frontend**: React Native (Expo) with TypeScript
- **Backend**: Supabase (for authentication, leaderboard, and user management)
- **Payments**: Stripe integration
- **UI**: Custom luxury components with animations and haptic feedback

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/thenothingapp.git
cd thenothingapp
```

2. Install dependencies
```
npm install
```

3. Configure Environment Variables
- Copy the `.env.example` file to `.env.local`
```
cp .env.example .env.local
```
- Update the `.env.local` file with your Supabase URL and anonymous key
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Configure Supabase
- Create a Supabase project
- Add the Supabase URL and anon key to your `.env.local` file

5. Configure Stripe
- Create a Stripe account
- Update `app/config/stripe.ts` with your Stripe publishable key

6. Start the development server
```
npm start
```

7. Run on your device or simulator
- Press `i` for iOS simulator
- Press `a` for Android simulator
- Scan the QR code with the Expo Go app on your device

## Demo Instructions

1. Launch the app
2. At the invite screen, try any invite code 3 times (it's designed to fail the first 2 attempts)
3. Enter a net worth of at least $1,000,000
4. Choose your luxury tier
5. Enjoy doing absolutely nothing with your expensive app
6. Share your wealth on social media
7. Check the leaderboard to see the wealthiest users

## "Ultra-Elite" Mode

Long-press on the user review in the dashboard to discover a hidden feature.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This app is satirical in nature. It is designed as a social experiment and is not intended to provide any actual functionality except for the digital flex itself. No refunds. 