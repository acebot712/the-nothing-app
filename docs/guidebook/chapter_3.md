# Chapter 3: State Management and Supabase Integration

## Introduction

Modern mobile applications need robust state management and data persistence solutions. In this chapter, we'll explore how "The Nothing App" manages application state and integrates with Supabase, a powerful Firebase alternative built on PostgreSQL.

## State Management Fundamentals

Before diving into specific implementations, let's understand the core principles of state management in React Native applications:

### Types of State

1. **Local Component State**: Managed with `useState` and confined to a single component
2. **Shared Application State**: Data needed across multiple components
3. **Server State**: Data that originates from and syncs with a backend
4. **Navigation State**: The current screen hierarchy and parameters
5. **Form State**: User inputs and validation status

Understanding which type of state you're dealing with helps determine the appropriate management approach.

## React's Built-in State Management

React provides several mechanisms for managing state:

### useState Hook

The most basic form of state management:

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <View>
      <Text>Count: {count}</Text>
      <Button title="Increment" onPress={() => setCount(count + 1)} />
    </View>
  );
}
```

### useReducer Hook

For more complex state logic:

```jsx
const initialState = { count: 0 };

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    default:
      throw new Error();
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <View>
      <Text>Count: {state.count}</Text>
      <Button title="+" onPress={() => dispatch({ type: 'increment' })} />
      <Button title="-" onPress={() => dispatch({ type: 'decrement' })} />
    </View>
  );
}
```

### Context API

For sharing state across the component tree:

```jsx
// Create a context
const ThemeContext = createContext('light');

// Provider component
function App() {
  const [theme, setTheme] = useState('light');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <MainNavigator />
    </ThemeContext.Provider>
  );
}

// Consumer component
function ThemedButton() {
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <Button
      title="Toggle Theme"
      onPress={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      color={theme === 'light' ? '#000' : '#fff'}
      backgroundColor={theme === 'light' ? '#fff' : '#000'}
    />
  );
}
```

## State Management in "The Nothing App"

"The Nothing App" uses a hybrid approach to state management:

1. **Local State**: For component-specific UI state
2. **Context API**: For shared application state like theme and user data
3. **Supabase**: For persistent data and real-time synchronization

Let's examine the user authentication state management implementation:

```jsx
// UserContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

type UserContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const fetchUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data?.session?.user ?? null);
      setLoading(false);

      // Set up listener for auth changes
      const { data: authListener } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setUser(session?.user ?? null);
        }
      );

      return () => {
        authListener?.subscription.unsubscribe();
      };
    };

    fetchUser();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <UserContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook for using the context
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
```

## Introduction to Supabase

Supabase is an open-source Firebase alternative that provides:

1. **PostgreSQL Database**: A powerful relational database
2. **Authentication**: Built-in user management with multiple providers
3. **Real-time Subscriptions**: Live data updates via WebSockets
4. **Storage**: File storage and management
5. **Edge Functions**: Serverless functions for custom logic

### Setting Up Supabase in "The Nothing App"

The app initializes Supabase in a dedicated client:

```javascript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY } from '@env';

if (!EXPO_PUBLIC_SUPABASE_URL || !EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(
  EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
```

### Database Schema

"The Nothing App" uses a relational schema that includes:

```sql
-- User profiles (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE,
  avatar_url TEXT,
  tier TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User transactions
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User achievements
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  achievement_type TEXT NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Database Access Patterns

The app uses several patterns to interact with Supabase:

#### Basic CRUD Operations

```typescript
// Create a new profile
const createProfile = async (userId: string, username: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert([{ id: userId, username }]);

  if (error) throw error;
  return data;
};

// Read a profile
const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};

// Update a profile
const updateProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) throw error;
  return data;
};

// Delete data
const deleteAchievement = async (achievementId: string) => {
  const { error } = await supabase
    .from('achievements')
    .delete()
    .eq('id', achievementId);

  if (error) throw error;
};
```

#### Real-time Subscriptions

```typescript
// Subscribe to profile changes
const subscribeToProfile = (userId: string, callback: (profile: any) => void) => {
  const subscription = supabase
    .from(`profiles:id=eq.${userId}`)
    .on('UPDATE', (payload) => {
      callback(payload.new);
    })
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};
```

## Optimizing Database Access

### Data Hooks

"The Nothing App" encapsulates Supabase interactions in custom hooks:

```typescript
// hooks/useProfile.ts
export function useProfile(userId: string) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) throw error;
        if (isMounted) setProfile(data);
      } catch (err) {
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();

    // Set up real-time subscription
    const subscription = supabase
      .from(`profiles:id=eq.${userId}`)
      .on('UPDATE', (payload) => {
        if (isMounted) setProfile(payload.new);
      })
      .subscribe();

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [userId]);

  return { profile, loading, error };
}
```

### Caching Strategy

The app implements a caching strategy for improved performance:

```typescript
// Cache manager
const cache = new Map();

export async function fetchWithCache(key, fetchFn) {
  // Check if data is in cache and not expired
  const cachedData = cache.get(key);
  if (cachedData && Date.now() - cachedData.timestamp < 5 * 60 * 1000) {
    return cachedData.data;
  }

  // Fetch fresh data
  const data = await fetchFn();

  // Update cache
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });

  return data;
}

// Usage example
const getUserAchievements = async (userId) => {
  return fetchWithCache(
    `achievements-${userId}`,
    async () => {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data;
    }
  );
};
```

## Authentication Flows

### Sign Up

```typescript
const signUp = async (email: string, password: string, username: string) => {
  // Create the user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) throw authError;

  // Create the user profile
  if (authData.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{ id: authData.user.id, username }]);

    if (profileError) {
      // Clean up: delete the auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }
  }

  return authData;
};
```

### Social Authentication

```typescript
const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  });

  if (error) throw error;
  return data;
};
```

## Error Handling and Offline Support

"The Nothing App" implements robust error handling:

```typescript
// API wrapper with error handling and offline support
export async function safelyExecuteQuery(queryFn) {
  try {
    // Check for internet connection
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      throw new Error('No internet connection');
    }

    // Execute the query
    return await queryFn();
  } catch (error) {
    // Log the error
    console.error('Database operation failed:', error);

    // Store failed operation for retry if appropriate
    if (isRetryableError(error)) {
      await storeForRetry(queryFn);
    }

    // Rethrow with more context
    throw new AppError('Database operation failed', {
      originalError: error,
      isOffline: !netInfo.isConnected,
      isRetryable: isRetryableError(error),
    });
  }
}
```

## Testing Supabase Integrations

The app includes comprehensive tests for database operations:

```typescript
// __tests__/profile.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useProfile } from '../hooks/useProfile';
import { supabase } from '../lib/supabase';

// Mock Supabase client
jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('useProfile hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('fetches profile data', async () => {
    // Mock Supabase response
    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: { id: '123', username: 'testuser' },
          error: null,
        }),
      }),
    });

    const mockSubscribe = jest.fn().mockReturnValue({
      unsubscribe: jest.fn(),
    });

    const mockOn = jest.fn().mockReturnValue({
      subscribe: mockSubscribe,
    });

    supabase.from.mockReturnValue({
      select: mockSelect,
      on: mockOn,
    });

    // Render the hook
    const { result, waitForNextUpdate } = renderHook(() => useProfile('123'));

    // Initially loading
    expect(result.current.loading).toBe(true);

    // Wait for the hook to update
    await waitForNextUpdate();

    // Check the result
    expect(result.current.loading).toBe(false);
    expect(result.current.profile).toEqual({ id: '123', username: 'testuser' });
    expect(result.current.error).toBe(null);

    // Verify Supabase was called correctly
    expect(supabase.from).toHaveBeenCalledWith('profiles');
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockOn).toHaveBeenCalledWith('UPDATE', expect.any(Function));
    expect(mockSubscribe).toHaveBeenCalled();
  });
});
```

## Advanced Patterns

### Transactions with RLS Policies

"The Nothing App" uses Row Level Security (RLS) for data protection:

```sql
-- Enable RLS on the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for profile access
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);
```

### Database Functions

The app uses PostgreSQL functions for complex operations:

```sql
-- Function to upgrade a user's tier
CREATE OR REPLACE FUNCTION public.upgrade_user_tier(
  user_id UUID,
  new_tier TEXT,
  payment_amount INTEGER,
  payment_currency TEXT
)
RETURNS VOID AS $$
BEGIN
  -- Update the user's tier
  UPDATE public.profiles
  SET tier = new_tier,
      updated_at = now()
  WHERE id = user_id;

  -- Record the transaction
  INSERT INTO public.transactions (
    user_id,
    amount,
    currency,
    status,
    payment_method
  ) VALUES (
    user_id,
    payment_amount,
    payment_currency,
    'completed',
    'stripe'
  );

  -- Grant achievement if applicable
  IF new_tier = 'god' THEN
    INSERT INTO public.achievements (
      user_id,
      achievement_type
    ) VALUES (
      user_id,
      'god_tier_unlocked'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Conclusion

State management and data persistence are foundational aspects of mobile application development. In "The Nothing App," we've implemented a robust architecture that combines React's built-in state management capabilities with Supabase's powerful database and authentication services.

By using Context API for global state, custom hooks for encapsulating database logic, and Supabase for real-time data synchronization, we've created a maintainable and scalable application that delivers a seamless user experience.

In the next chapter, we'll explore payment processing with Stripe, examining how "The Nothing App" handles subscriptions, one-time purchases, and payment flows.

## Exercises

1. Implement a new custom hook that fetches and subscribes to the user's transactions from Supabase.
2. Add offline support to an existing database operation using AsyncStorage for temporary data storage.
3. Create a leaderboard feature that uses Supabase to track and display user statistics.
4. Implement a caching mechanism for frequently accessed data to improve performance.
5. Add error handling and loading states to an existing component that uses Supabase data.
