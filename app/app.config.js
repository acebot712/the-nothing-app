// Import configuration from app.json
import appJson from './app.json';

export default {
  // Spread app.json config
  ...appJson.expo,
  
  // Set the owner
  owner: "acebot712",
  
  // iOS specific configuration
  ios: {
    ...(appJson.expo.ios || {}),
    bundleIdentifier: 'com.acebot712.thenothingapp'
  },
  
  // Environment variables
  extra: {
    ...(appJson.expo.extra || {}),
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
  }
}; 