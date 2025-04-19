// src/app/dashboard/page.tsx
'use client'; // Needs client hooks (useAuth, useState, useEffect)

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext'; // Import the auth hook
import { useRouter } from 'next/navigation';
import { signOut, fetchAuthSession } from 'aws-amplify/auth';
import styles from './Dashboard.module.css';

export default function DashboardPage() {
  const { user, userId, isLoading } = useAuth();
  const router = useRouter();
  const [apiData, setApiData] = useState([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isApiLoading, setIsApiLoading] = useState(false);

  // Effect to redirect if not authenticated
  useEffect(() => {
    // Don't redirect while initial auth check is loading
    if (!isLoading && !user) {
      console.log("User not authenticated, redirecting to login.");
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      // AuthContext Hub listener should handle state update and potential redirect
      // Or redirect manually:
      router.push('/'); // Redirect to home page after sign out
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  // Function to fetch data from the protected API Gateway endpoint
  const fetchDataFromApi = async () => {
    setApiError(null);
    setIsApiLoading(true);
    setApiData([]);

    if (!process.env.NEXT_PUBLIC_API_GATEWAY_URL) {
        setApiError("API Gateway URL is not configured in environment variables.");
        setIsApiLoading(false);
        return;
    }

    try {
      // Get the current session which includes the ID token
      const session = await fetchAuthSession({ forceRefresh: false }); // Use cached session if possible
      const idToken = session.tokens?.idToken?.toString(); // Get the JWT ID token

      if (!idToken) {
        throw new Error("Could not retrieve ID token. User might not be fully authenticated.");
      }

      // Make the authenticated request using standard fetch
      const response = await fetch(process.env.NEXT_PUBLIC_API_GATEWAY_URL, {
        method: 'GET', // Or 'POST', 'PUT', etc. depending on your API
        headers: {
          'Authorization': `Bearer ${idToken}`, // Pass the ID token in the Authorization header
          'Content-Type': 'application/json',
        },
        // body: JSON.stringify({ key: 'value' }), // Add body for POST/PUT requests
      });

      if (!response.ok) {
        // Try to get error message from response body
        let errorBody = 'Failed to fetch data from API.';
        try {
            const errorJson = await response.json();
            errorBody = errorJson.message || JSON.stringify(errorJson);
        } catch { // Removed unused variable 'e'
            // Ignore if response body is not JSON or empty
        }
        throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
      }

      const data = await response.json();
      setApiData(data);

    } catch (error) { // Changed from catch (error: any)
      console.error('Error fetching API data:', error);
      // Type check for error object before setting message
      let errorMessage = 'An unexpected error occurred while fetching data.';
      if (error instanceof Error) {
        errorMessage = error.message;
        // If fetchAuthSession fails, it might mean the user needs to re-login
        if (error.message.includes("Could not retrieve ID token")) {
            // Optional: force re-check or redirect to login
            // checkAuthState(); // Re-validate auth state
            // router.push('/login');
        }
      } else if (typeof error === 'string') {
          errorMessage = error;
      }
      setApiError(errorMessage);
    } finally {
      setIsApiLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return <div>Loading authentication status...</div>;
  }

  // If user is null after loading, this component shouldn't render (due to redirect)
  // But as a fallback:
  if (!user) {
     return <div>Redirecting to login...</div>; // Or null
  }

  // Render dashboard content if authenticated
  return (
    <div className={styles.dashboardContainer}>
      {/* Apply the welcomeMessage class */}
      <h1 className={styles.welcomeMessage}>Dashboard</h1>
      <p>Welcome, {user.username || 'User'}!</p>
      {userId && <p className={styles.userIdText}>User ID: {userId}</p>}

      {/* Apply the actionButton class */}
      <button onClick={handleSignOut} className={styles.actionButton}>Sign Out</button>

      {/* Apply the apiSection class */}
      <div className={styles.apiSection}>
        {/* Apply the apiTitle class */}
        <h2 className={styles.apiTitle}>API Data</h2>
        {/* Apply the actionButton class */}
        <button onClick={fetchDataFromApi} disabled={isApiLoading} className={styles.actionButton}>
          {isApiLoading ? 'Loading Data...' : 'Fetch Data from Protected API'}
        </button>

        {/* Apply apiLoading class */}
        {isApiLoading && <p className={styles.loadingText}>Fetching data...</p>}
        {/* Apply apiError class */}
        {apiError && <p className={styles.apiError}>Error: {apiError}</p>}

        {apiData && (
          // Apply apiData class
          <div className={styles.apiData}>
            <h3>Data Received:</h3>
            <pre>{JSON.stringify(apiData, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}