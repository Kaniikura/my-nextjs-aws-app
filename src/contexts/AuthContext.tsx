// src/contexts/AuthContext.tsx
'use client'; // Context Providers often need client-side hooks like useState, useEffect

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Hub } from 'aws-amplify/utils'; // Hub for listening to auth events
import { getCurrentUser, AuthUser } from 'aws-amplify/auth';

// Define the shape of the context data
interface AuthContextType {
  user: AuthUser | null; // Can be AmplifyUser or any specific user type you define
  userId: string | null;
  isLoading: boolean; // To handle initial auth state loading
  checkAuthState: () => Promise<void>; // Function to manually check auth state
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the props for the provider component
interface AuthProviderProps {
  children: ReactNode;
}

// Create the provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start as loading

  // Function to check the current authentication status
  const checkAuthState = async () => {
    setIsLoading(true);
    try {
      const cognitoUser = await getCurrentUser();
      console.log("Current Authenticated User:", cognitoUser);
      setUser(cognitoUser);
      setUserId(cognitoUser.userId); // Or username depending on your needs
      // Optionally fetch additional attributes
      // const attributes = await fetchUserAttributes();
      // console.log("User attributes:", attributes);
    } catch (error) {
      console.log("No authenticated user found:", error);
      setUser(null);
      setUserId(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to check authentication state on initial load and listen for auth events
  useEffect(() => {
    checkAuthState(); // Check on initial mount

    // Listen for authentication events (signIn, signOut, etc.) using Amplify Hub
    const hubListenerCancel = Hub.listen('auth', ({ payload }) => {
      const { event } = payload;
      console.log('Auth event:', event);
      switch (event) {
        case 'signedIn':
          checkAuthState(); // Re-check auth state after sign in
          break;
        case 'signedOut':
          setUser(null); // Clear user state immediately on sign out
          setUserId(null);
          // Optional: Redirect to login or home page after sign out
          // router.push('/login');
          break;
        // Add other cases like 'signUp', 'confirmSignUp', 'forgotPasswordSubmit', etc. if needed
      }
    });

    // Cleanup function to remove the listener when the component unmounts
    return () => {
      hubListenerCancel(); // Remove the listener
    };
  }, []); // Run only once on mount


  // Provide the context value to children
  return (
    <AuthContext.Provider value={{ user, userId, isLoading, checkAuthState }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily consume the context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};