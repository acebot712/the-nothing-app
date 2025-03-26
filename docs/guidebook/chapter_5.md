# Chapter 5: Optimization and Deployment

## Introduction

After building a feature-rich mobile application, the final crucial steps involve optimizing performance and deploying to app stores. In this chapter, we'll explore how "The Nothing App" is optimized for production and walk through the deployment process using Expo's powerful build tools.

## Performance Optimization

Before deploying to production, optimizing your app's performance is essential for providing a smooth user experience across various devices.

### Measuring Performance

The first step in optimization is establishing reliable metrics:

```typescript
// app/utils/performance.ts
import { InteractionManager } from 'react-native';
import * as Sentry from '@sentry/react-native';

export function measureRenderTime(componentName: string) {
  const startTime = Date.now();

  return () => {
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.debug(`[Performance] ${componentName} rendered in ${duration}ms`);

    // Report to analytics for significant renders
    if (duration > 500) {
      Sentry.addBreadcrumb({
        category: 'performance',
        message: `Slow render: ${componentName} (${duration}ms)`,
        level: 'warning',
      });
    }

    return duration;
  };
}

export function deferTask(task: () => void, description = 'deferred task') {
  InteractionManager.runAfterInteractions(() => {
    const startTime = Date.now();
    task();
    const duration = Date.now() - startTime;

    console.debug(`[Performance] Completed ${description} in ${duration}ms`);
  });
}
```

### React Component Optimization

#### Memoization

```jsx
// Before optimization
function ExpensiveComponent({ data, onPress }) {
  // This component re-renders whenever any prop changes
  const processedData = expensiveCalculation(data);

  return (
    <View>
      {processedData.map(item => (
        <TouchableOpacity key={item.id} onPress={() => onPress(item)}>
          <Text>{item.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// After optimization
const ExpensiveComponent = React.memo(
  function ExpensiveComponent({ data, onPress }) {
    // Memoize expensive calculations
    const processedData = useMemo(() => expensiveCalculation(data), [data]);

    // Memoize callback functions
    const handlePress = useCallback((item) => {
      onPress(item);
    }, [onPress]);

    return (
      <View>
        {processedData.map(item => (
          <TouchableOpacity key={item.id} onPress={() => handlePress(item)}>
            <Text>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  },
  // Custom comparison function for props
  (prevProps, nextProps) => {
    return isEqual(prevProps.data, nextProps.data) &&
           prevProps.onPress === nextProps.onPress;
  }
);
```

#### Virtualized Lists

For long scrollable content, "The Nothing App" uses optimized list components:

```jsx
// Before optimization
function UserList({ users }) {
  return (
    <ScrollView>
      {users.map(user => (
        <UserItem key={user.id} user={user} />
      ))}
    </ScrollView>
  );
}

// After optimization
function UserList({ users }) {
  const renderItem = useCallback(({ item }) => {
    return <UserItem user={item} />;
  }, []);

  const keyExtractor = useCallback((item) => item.id, []);

  return (
    <FlatList
      data={users}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews={true}
      getItemLayout={(data, index) => ({
        length: 80, // Height of the item
        offset: 80 * index,
        index,
      })}
    />
  );
}
```

### Image Optimization

Efficient image handling is critical for performance:

```jsx
// app/components/OptimizedImage.tsx
import React, { useState } from 'react';
import { Image, View, ActivityIndicator, StyleSheet } from 'react-native';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

type OptimizedImageProps = {
  source: { uri: string };
  style: any;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  quality?: number; // 0 to 1
  maxWidth?: number;
};

export function OptimizedImage({
  source,
  style,
  resizeMode = 'cover',
  quality = 0.7,
  maxWidth = 600,
}: OptimizedImageProps) {
  const [optimizedSource, setOptimizedSource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  React.useEffect(() => {
    let isMounted = true;

    const optimizeImage = async () => {
      try {
        setLoading(true);

        // Skip optimization for local assets
        if (!source.uri || source.uri.startsWith('file://') || source.uri.startsWith('asset://')) {
          setOptimizedSource(source);
          setLoading(false);
          return;
        }

        // Optimize the image
        const manipResult = await manipulateAsync(
          source.uri,
          [{ resize: { width: maxWidth } }],
          { compress: quality, format: SaveFormat.JPEG }
        );

        if (isMounted) {
          setOptimizedSource({ uri: manipResult.uri });
          setLoading(false);
        }
      } catch (err) {
        console.error('Image optimization failed:', err);
        if (isMounted) {
          setOptimizedSource(source); // Fallback to original
          setError(true);
          setLoading(false);
        }
      }
    };

    optimizeImage();

    return () => {
      isMounted = false;
    };
  }, [source.uri, quality, maxWidth]);

  if (loading) {
    return (
      <View style={[styles.container, style]}>
        <ActivityIndicator color="#D4AF37" />
      </View>
    );
  }

  return (
    <Image
      source={optimizedSource}
      style={style}
      resizeMode={resizeMode}
      onError={() => setError(true)}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
});
```

### Network Optimization

Efficient API calls significantly improve perceived performance:

```typescript
// app/services/api.ts
import { createClient } from './client';

const client = createClient({
  baseURL: config.apiUrl,
  timeout: 10000,
});

// Request queue for non-critical operations
const requestQueue = [];
let isProcessingQueue = false;

// Process queued requests when the app is idle
function processQueue() {
  if (isProcessingQueue || requestQueue.length === 0) return;

  isProcessingQueue = true;

  const request = requestQueue.shift();

  request.execute()
    .finally(() => {
      isProcessingQueue = false;
      processQueue(); // Process next request
    });
}

// For critical requests (blocking UI)
export async function fetchCriticalData(endpoint, params) {
  // Add retry logic for critical requests
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      return await client.get(endpoint, { params });
    } catch (error) {
      attempts++;

      if (attempts >= maxAttempts) {
        throw error;
      }

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts)));
    }
  }
}

// For non-critical requests (background operations)
export function queueBackgroundRequest(endpoint, params, callback) {
  requestQueue.push({
    execute: async () => {
      try {
        const response = await client.get(endpoint, { params });
        callback(response, null);
      } catch (error) {
        callback(null, error);
      }
    },
  });

  processQueue();
}
```

### State Management Optimization

Optimizing how we manage application state:

```typescript
// app/contexts/OptimizedUserContext.tsx
import React, { createContext, useContext, useReducer, useCallback } from 'react';

// Define action types
const ACTIONS = {
  SET_USER: 'SET_USER',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  LOGOUT: 'LOGOUT',
};

// Initial state
const initialState = {
  user: null,
  profile: null,
  loading: false,
  error: null,
};

// Reducer function
function userReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_USER:
      return { ...state, user: action.payload, loading: false };

    case ACTIONS.UPDATE_PROFILE:
      return { ...state, profile: { ...state.profile, ...action.payload } };

    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    case ACTIONS.LOGOUT:
      return { ...initialState };

    default:
      return state;
  }
}

// Create the context
const UserContext = createContext(null);

// Provider component
export function UserProvider({ children }) {
  const [state, dispatch] = useReducer(userReducer, initialState);

  // Memoized action creators
  const setUser = useCallback((user) => {
    dispatch({ type: ACTIONS.SET_USER, payload: user });
  }, []);

  const updateProfile = useCallback((profileData) => {
    dispatch({ type: ACTIONS.UPDATE_PROFILE, payload: profileData });
  }, []);

  const setLoading = useCallback((isLoading) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: isLoading });
  }, []);

  const setError = useCallback((error) => {
    dispatch({ type: ACTIONS.SET_ERROR, payload: error });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_ERROR });
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: ACTIONS.LOGOUT });
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const value = React.useMemo(() => ({
    ...state,
    setUser,
    updateProfile,
    setLoading,
    setError,
    clearError,
    logout,
  }), [state, setUser, updateProfile, setLoading, setError, clearError, logout]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
```

### Memory Leak Prevention

Preventing memory leaks is essential for long app sessions:

```jsx
// Before optimization
function ProfileScreen({ userId }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // This might cause a memory leak if the component unmounts
    // before the fetch completes
    fetchUserProfile(userId).then(data => {
      setProfile(data);
    });

    // Subscribe to real-time updates
    const subscription = subscribeToProfileUpdates(userId, (data) => {
      setProfile(data);
    });

    // Missing cleanup function
  }, [userId]);

  // Component code...
}

// After optimization
function ProfileScreen({ userId }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let isMounted = true;

    fetchUserProfile(userId).then(data => {
      // Only update state if component is still mounted
      if (isMounted) {
        setProfile(data);
      }
    });

    // Subscribe to real-time updates
    const subscription = subscribeToProfileUpdates(userId, (data) => {
      if (isMounted) {
        setProfile(data);
      }
    });

    // Proper cleanup function
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [userId]);

  // Component code...
}
```

## Preparing for Deployment

### Environment-Specific Configuration

"The Nothing App" uses different configurations for development, staging, and production:

```javascript
// app.config.js
const packageJson = require('./package.json');

const getEnvironment = () => {
  const envFromArgs = process.argv.find(arg => arg.includes('--env='));
  if (envFromArgs) {
    return envFromArgs.split('=')[1];
  }
  return process.env.APP_ENV || 'development';
};

const env = getEnvironment();

// Base configuration shared across all environments
const baseConfig = {
  name: "The Nothing App",
  slug: "thenothingapp",
  version: packageJson.version,
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "dark",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#0A0A0A"
  },
  assetBundlePatterns: [
    "**/*"
  ],
  ios: {
    supportsTablet: false,
    bundleIdentifier: "com.thenothingapp"
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#0A0A0A"
    },
    package: "com.thenothingapp"
  },
  web: {
    favicon: "./assets/favicon.png"
  },
  plugins: [
    "sentry-expo",
    [
      "expo-build-properties",
      {
        "ios": {
          "useFrameworks": "static"
        }
      }
    ]
  ]
};

// Environment-specific configurations
const envConfigs = {
  development: {
    name: "Nothing (Dev)",
    ios: {
      ...baseConfig.ios,
      bundleIdentifier: "com.thenothingapp.dev"
    },
    android: {
      ...baseConfig.android,
      package: "com.thenothingapp.dev"
    },
    extra: {
      environment: "development",
      eas: {
        projectId: "your-eas-project-id"
      }
    }
  },
  staging: {
    name: "Nothing (Staging)",
    ios: {
      ...baseConfig.ios,
      bundleIdentifier: "com.thenothingapp.staging"
    },
    android: {
      ...baseConfig.android,
      package: "com.thenothingapp.staging"
    },
    extra: {
      environment: "staging",
      eas: {
        projectId: "your-eas-project-id"
      }
    }
  },
  production: {
    extra: {
      environment: "production",
      eas: {
        projectId: "your-eas-project-id"
      }
    }
  }
};

// Export the merged configuration
module.exports = {
  ...baseConfig,
  ...(envConfigs[env] || envConfigs.development)
};
```

### Feature Flagging

"The Nothing App" implements feature flags to safely roll out new features:

```typescript
// app/utils/featureFlags.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const { environment } = Constants.expoConfig?.extra || {};
const isProd = environment === 'production';

// Default feature flags
const DEFAULT_FLAGS = {
  enablePayments: true,
  enableNotifications: true,
  enableSocialSharing: true,
  enableDarkTheme: true,
  enableVoiceCommands: !isProd, // Only in non-prod environments
  enableBetaFeatures: !isProd,
};

// Remote flags (from your backend)
let REMOTE_FLAGS = {};

// User segment (used for targeted flags)
let USER_SEGMENT = 'default';

// Initialize feature flags
export async function initFeatureFlags(userProfile) {
  try {
    // Determine user segment based on profile data
    if (userProfile) {
      if (userProfile.tier === 'god') {
        USER_SEGMENT = 'premium';
      } else if (userProfile.createdAt && new Date(userProfile.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
        USER_SEGMENT = 'new';
      } else {
        USER_SEGMENT = 'regular';
      }
    }

    // Try to load cached flags
    const cachedFlags = await AsyncStorage.getItem('featureFlags');
    if (cachedFlags) {
      REMOTE_FLAGS = JSON.parse(cachedFlags);
    }

    // Fetch fresh flags from backend
    const response = await fetch(`${apiUrl}/feature-flags?segment=${USER_SEGMENT}&platform=${Platform.OS}`);
    const freshFlags = await response.json();

    REMOTE_FLAGS = freshFlags;

    // Cache the flags
    await AsyncStorage.setItem('featureFlags', JSON.stringify(freshFlags));
  } catch (error) {
    console.warn('Failed to fetch feature flags:', error);
    // Continue with cached or default flags
  }
}

// Check if a feature is enabled
export function isFeatureEnabled(featureName) {
  // Override for development purposes
  if (__DEV__ && AsyncStorage.getItem(`debug_${featureName}`) === 'true') {
    return true;
  }

  // Check remote flag first, fall back to default
  return REMOTE_FLAGS[featureName] !== undefined
    ? REMOTE_FLAGS[featureName]
    : DEFAULT_FLAGS[featureName] || false;
}
```

### Error Monitoring

Implementing robust error monitoring for production:

```typescript
// app/utils/errorReporting.ts
import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

// Initialize Sentry
export function initErrorReporting() {
  const { environment } = Constants.expoConfig?.extra || {};

  Sentry.init({
    dsn: 'https://your-sentry-dsn@sentry.io/project',
    environment,
    beforeSend: (event) => {
      // Filter out certain errors or modify event data
      if (event.exception?.values?.[0]?.value?.includes('Network request failed')) {
        event.fingerprint = ['network-error'];
      }
      return event;
    },
    // Enable performance monitoring
    tracesSampleRate: 0.2,
  });
}

// Report a handled error
export function reportError(error, context = {}) {
  if (__DEV__) {
    console.error('Error:', error, 'Context:', context);
  }

  Sentry.captureException(error, {
    extra: context,
  });
}

// Create error boundary component
export const ErrorBoundary = Sentry.withErrorBoundary(
  ({ children }) => children,
  {
    fallback: ({ error, resetError }) => (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorMessage}>{error.message}</Text>
        <Button title="Try Again" onPress={resetError} />
      </View>
    ),
  }
);
```

## Building with EAS Build

Expo Application Services (EAS) provides powerful tools for building and deploying Expo applications. Let's explore how "The Nothing App" uses EAS:

### EAS Configuration

```json
// eas.json
{
  "cli": {
    "version": ">= 3.10.0",
    "requireCommit": true
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      },
      "env": {
        "APP_ENV": "development"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "env": {
        "APP_ENV": "staging"
      }
    },
    "production": {
      "autoIncrement": true,
      "env": {
        "APP_ENV": "production"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCDEF1234"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "production"
      }
    }
  }
}
```

### Building for Different Platforms

```bash
# Build for iOS development
eas build --platform ios --profile development

# Build for Android internal testing
eas build --platform android --profile preview

# Build for production release
eas build --platform all --profile production
```

### Automating Builds with CI/CD

"The Nothing App" uses GitHub Actions for continuous integration and deployment:

```yaml
# .github/workflows/eas-build.yml
name: EAS Build
on:
  push:
    branches:
      - main
      - staging
  pull_request:
    branches:
      - main

jobs:
  build:
    name: Install and build
    runs-on: ubuntu-latest
    steps:
      - name: Check out repository
        uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18.x
          cache: npm

      - name: Setup EAS
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Install dependencies
        run: npm ci

      - name: Run lint and type checking
        run: |
          npm run lint
          npm run typecheck

      - name: Determine build profile
        id: determine-profile
        run: |
          if [ "${{ github.ref }}" = "refs/heads/main" ]; then
            echo "profile=production" >> "$GITHUB_OUTPUT"
          elif [ "${{ github.ref }}" = "refs/heads/staging" ]; then
            echo "profile=preview" >> "$GITHUB_OUTPUT"
          else
            echo "profile=development" >> "$GITHUB_OUTPUT"
          fi

      - name: Build app
        run: eas build --platform all --profile ${{ steps.determine-profile.outputs.profile }} --non-interactive
```

## Submitting to App Stores

The final step is submitting your application to the app stores:

### App Store Connect Preparation

Before submitting to Apple's App Store:

1. Create an app entry in App Store Connect
2. Prepare marketing materials (screenshots, descriptions)
3. Configure pricing and availability
4. Set up privacy information and permissions

### Google Play Console Preparation

Before submitting to Google Play:

1. Create an app entry in the Google Play Console
2. Prepare store listing materials
3. Configure pricing and distribution
4. Complete the content rating questionnaire
5. Set up privacy policy

### EAS Submit

Using EAS to submit builds to the app stores:

```bash
# Submit iOS build
eas submit --platform ios --profile production

# Submit Android build
eas submit --platform android --profile production
```

## Production Monitoring

After deployment, monitoring the app's performance in production is crucial:

```typescript
// app/utils/analytics.ts
import Analytics from '@segment/analytics-react-native';
import * as Sentry from '@sentry/react-native';
import { Platform, Dimensions } from 'react-native';
import DeviceInfo from 'react-native-device-info';

// Initialize analytics
export function initAnalytics(userId = null) {
  Analytics.setup('YOUR_SEGMENT_KEY', {
    trackAppLifecycleEvents: true,
    recordScreenViews: true,
  });

  if (userId) {
    Analytics.identify(userId, {
      platform: Platform.OS,
      deviceModel: DeviceInfo.getModel(),
      osVersion: DeviceInfo.getSystemVersion(),
      appVersion: DeviceInfo.getVersion(),
      screenSize: `${Dimensions.get('window').width}x${Dimensions.get('window').height}`,
    });
  }
}

// Track screen views
export function trackScreen(screenName, properties = {}) {
  Analytics.screen(screenName, properties);
}

// Track custom events
export function trackEvent(eventName, properties = {}) {
  Analytics.track(eventName, properties);

  // Also add breadcrumb to Sentry for debugging
  Sentry.addBreadcrumb({
    category: 'analytics',
    message: eventName,
    level: 'info',
    data: properties,
  });
}

// Track app performance metrics
export function trackPerformance(name, durationMs) {
  if (durationMs > 1000) {
    // Report slow operations
    trackEvent('Performance Issue', {
      operation: name,
      durationMs,
    });

    Sentry.captureMessage(`Slow operation: ${name} (${durationMs}ms)`, {
      level: 'warning',
      tags: { performance: 'slow' },
    });
  }

  // Always track performance data
  trackEvent('Performance Metric', {
    operation: name,
    durationMs,
  });
}
```

## Over-the-Air Updates

One of Expo's most powerful features is the ability to push updates without going through the app stores using EAS Update:

```typescript
// app/utils/updates.ts
import * as Updates from 'expo-updates';
import { Alert } from 'react-native';
import { trackEvent } from './analytics';

// Check for updates
export async function checkForUpdates() {
  if (!Updates.channel) {
    console.log('Updates not configured');
    return false;
  }

  try {
    const update = await Updates.checkForUpdateAsync();

    if (update.isAvailable) {
      trackEvent('Update Available', {
        channel: Updates.channel,
        currentVersion: Updates.manifest?.version,
      });

      await fetchAndApplyUpdate();
      return true;
    }
  } catch (error) {
    console.error('Failed to check for updates:', error);
  }

  return false;
}

// Fetch and apply an update
async function fetchAndApplyUpdate() {
  try {
    // Download the update
    const { isNew } = await Updates.fetchUpdateAsync();

    if (isNew) {
      trackEvent('Update Downloaded', {
        channel: Updates.channel,
      });

      // Prompt the user to restart
      Alert.alert(
        'Update Available',
        'A new version is available. Restart now to apply updates?',
        [
          {
            text: 'Later',
            style: 'cancel',
            onPress: () => trackEvent('Update Deferred'),
          },
          {
            text: 'Restart',
            onPress: async () => {
              trackEvent('Update Applied');
              await Updates.reloadAsync();
            },
          },
        ]
      );
    }
  } catch (error) {
    console.error('Failed to fetch or apply update:', error);
  }
}
```

### Managing Update Channels

```bash
# Create a new update for the production channel
eas update --channel production

# Create a new update for beta testers
eas update --channel beta

# Create a new update for a specific app version
eas update --channel production-v1.2.0 --message "Fix login issue"
```

## App Store Optimization

To maximize visibility in the app stores, "The Nothing App" employs several App Store Optimization (ASO) techniques:

### Keyword Optimization

Research and target relevant keywords in your app metadata:

```json
// app-store-metadata.json
{
  "title": "The Nothing App - Luxury Simplicity",
  "subtitle": "Exclusive Digital Minimalism",
  "description": "Experience the ultimate luxury of nothing...",
  "keywords": "luxury, minimalism, exclusivity, nothing, premium, status, digital wellbeing, mindfulness, zen, focus",
  "promotionalText": "Upgrade to the GOD tier for the ultimate nothing experience!"
}
```

### Screenshot and Video Strategy

Create compelling visual assets that showcase your app's unique value proposition, focusing on the premium experience rather than technical features.

## Conclusion

Optimizing and deploying a mobile application is a complex but crucial process that determines the success of your product. "The Nothing App" follows industry best practices for performance optimization, builds and deploys using Expo's powerful EAS platform, and implements comprehensive monitoring for production.

By implementing the techniques covered in this chapter—from component optimization to CI/CD automation to over-the-air updates—you can ensure that your Expo application delivers a seamless user experience while maintaining a sustainable development workflow.

In our final chapter, we'll explore advanced patterns and future directions for mobile development with Expo, including emerging trends, architectural patterns, and strategies for scaling your application.

## Exercises

1. Implement the `OptimizedImage` component and use it to replace standard Image components in the app.
2. Set up a GitHub Actions workflow for continuous integration that runs linting and type checking.
3. Create a performance monitoring system that tracks render times for key components.
4. Implement feature flags for a new experimental feature in the app.
5. Configure and test an over-the-air update for a small bug fix.
