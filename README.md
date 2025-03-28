# The Badge App

A simple React Native application that displays a special badge when you log in with OAuth providers.

## Features

- OAuth authentication with Google, GitHub, and Apple (iOS only)
- User profiles with different badge tiers
- Custom animated badge display
- Deep linking support for authentication callbacks

## Prerequisites

- Node.js 18 or higher
- Expo CLI
- Supabase account

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with Supabase credentials:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Setting up Supabase

1. Create a new Supabase project
2. Run the `supabase-setup.sql` script in the SQL Editor to set up the profiles table and triggers
3. Configure OAuth providers:

### Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or use an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Select "Web application" as the application type
6. Add the Supabase callback URL: `https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback`
7. Copy the Client ID and Client Secret
8. In Supabase Dashboard, go to Authentication > Providers
9. Enable Google and paste your Client ID and Client Secret

### GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details
4. Add the Supabase callback URL: `https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback`
5. Copy the Client ID and Client Secret
6. In Supabase Dashboard, go to Authentication > Providers
7. Enable GitHub and paste your Client ID and Client Secret

### Apple OAuth Setup (iOS only)

1. Go to the [Apple Developer Portal](https://developer.apple.com/)
2. Navigate to "Certificates, IDs & Profiles"
3. Create a new App ID with Sign In with Apple capability
4. Create a new Service ID with Sign In with Apple capability
5. Configure the domains and callback URLs, adding the Supabase callback URL
6. Create a key with Sign In with Apple capability
7. Download the key and note the Key ID
8. In Supabase Dashboard, go to Authentication > Providers
9. Enable Apple and fill in the required details

## Update the Deep Linking Configuration

1. Update the URL scheme in `app.config.js` to match your bundle identifier
2. Update the `redirectTo` URL in `supabase.ts` to match your scheme

## Running the App

```bash
npm start
```

Then, open the Expo Go app on your device or emulator and scan the QR code or press 'a' to open on Android emulator or 'i' to open on iOS simulator.

## Upgrading Badge Tiers

To upgrade a user's badge tier, you can update their profile in the Supabase database:

1. Go to Supabase Dashboard > Table Editor
2. Navigate to the 'profiles' table
3. Find the user's row and update the 'tier' column to 'elite' or 'god'
4. Optionally update the 'purchase_amount' column

## Troubleshooting

### OAuth Errors

If you encounter issues with OAuth login:

1. Check that your redirect URL is correct in the OAuth provider's settings
2. Verify that the Client ID and Client Secret are correctly set in Supabase
3. Ensure deep linking is properly configured in `app.config.js`

### Database Errors

1. Make sure the SQL script has been executed successfully
2. Check that the 'profiles' table exists and has the correct structure
3. Verify that the RLS policies are properly set up

## License

This project is licensed under the MIT License - see the LICENSE file for details.
