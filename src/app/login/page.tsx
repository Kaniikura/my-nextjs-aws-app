// src/app/login/page.tsx
'use client'; // Needs client-side interaction

import React, { useState } from 'react';
import { signIn } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import formStyles from '@/styles/Form.module.css';

export default function LoginPage() {
  const [username, setUsername] = useState(''); // Use username or email based on Cognito config
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  // const { checkAuthState } = useAuth(); // Or rely on Hub listener in AuthProvider

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { isSignedIn, nextStep } = await signIn({
          username, // This could be email or username
          password
      });

      console.log("Sign in result:", {isSignedIn, nextStep});

      if (isSignedIn) {
        // Auth state will be updated by the Hub listener in AuthContext
        // Redirect to a protected page
        router.push('/dashboard'); // Redirect after successful sign in
      } else {
        // Handle MFA, new password required, etc.
        console.log("Next step in sign in:", nextStep);
        // Example: Handle MFA
        // if (nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_SMS_MFA_CODE') {
        //   // Show MFA input field
        // }
         setError(`Sign in requires additional steps: ${nextStep.signInStep}`);
      }

    } catch (err) {
      console.error('Error signing in:', err);
      // Type check for error object
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'string') {
        setError(err);
      } else {
        setError('An unexpected error occurred during sign in.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Apply the formContainer class
    <div className={formStyles.formContainer}>
      {/* Apply the title class */}
      <h1 className={formStyles.title}>Sign In</h1>
      <form onSubmit={handleSignIn}>
        {/* Apply inputGroup class */}
        <div className={formStyles.inputGroup}>
          {/* Apply label class */}
          <label htmlFor="username" className={formStyles.label}>Email or Username:</label>
          {/* Apply inputField class (or rely on global styles) */}
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isLoading}
            className={formStyles.inputField} // Optional
          />
        </div>
        <div className={formStyles.inputGroup}>
          <label htmlFor="password" className={formStyles.label}>Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className={formStyles.inputField} // Optional
          />
        </div>
        {/* Apply errorMessage class */}
        {error && <p className={formStyles.errorMessage}>{error}</p>}
        {/* Apply submitButton class */}
        <button type="submit" disabled={isLoading} className={formStyles.submitButton}>
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
      {/* Apply linkText class */}
      <p className={formStyles.linkText}>
        Don&#39;t have an account? <Link href="/signup">Sign Up</Link>
      </p>
      {/* Add links for forgot password if needed */}
      {/* <p className={formStyles.linkText}>
        <Link href="/forgot-password">Forgot Password?</Link>
      </p> */}
    </div>
  );
}