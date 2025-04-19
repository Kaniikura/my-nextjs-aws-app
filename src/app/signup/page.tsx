// src/app/signup/page.tsx
'use client'; // Needs client-side interaction (useState, form handling)

import React, { useState } from 'react';
import { signUp, confirmSignUp, autoSignIn } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation'; // Use next/navigation for App Router
import Link from 'next/link';
import formStyles from '@/styles/Form.module.css'; 

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null); // Clear previous errors
    setIsLoading(true);

    try {
      const { isSignUpComplete, userId, nextStep } = await signUp({
        username: email, // Cognito often uses email as username by default
        password: password,
        options: {
          userAttributes: {
            email: email, // Include email as a user attribute
            // Add other attributes if needed, e.g., name: 'John Doe'
          },
          // Enable auto-signing in after successful sign up (optional)
          autoSignIn: true
        }
      });

      console.log('Sign up success:', { isSignUpComplete, userId, nextStep });

      if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        setNeedsConfirmation(true); // Show confirmation code input
      } else if (nextStep.signUpStep === 'DONE') {
         // If autoSignIn was enabled and successful, or sign up is complete without confirmation
         // You might still want to check if autoSignIn happened
         try {
             const signInOutput = await autoSignIn();
             console.log("Auto sign in result:", signInOutput);
             // If auto sign-in is handled by Hub listener in AuthContext, no need to redirect here
             // otherwise:
             // router.push('/dashboard'); // Redirect to a protected route
         } catch(autoSignInError) {
             console.error("Auto sign in failed:", autoSignInError);
             // User is signed up but needs to login manually
             router.push('/login');
         }
      }
    } catch (err) {
      console.error('Error signing up:', err);
      // Type check for error object
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'string') {
        setError(err);
      } else {
        setError('An unexpected error occurred during sign up.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmation = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { isSignUpComplete, nextStep } = await confirmSignUp({
        username: email,
        confirmationCode: confirmCode,
      });

      console.log('Confirmation result:', { isSignUpComplete, nextStep });

      if (isSignUpComplete) {
          // Sign up confirmed, attempt auto sign in if not already done
          try {
             await autoSignIn();
             // Hub listener in AuthContext should handle the navigation/state update
             // Or redirect manually if needed:
             // router.push('/dashboard');
          } catch(autoSignInError) {
             console.error("Auto sign in after confirmation failed:", autoSignInError);
             // User is confirmed but needs to login manually
             router.push('/login');
          }
      } else {
          // Handle cases where confirmation might need more steps (unlikely for simple code)
          console.log("Confirmation next step:", nextStep);
      }

    } catch (err) {
      console.error('Error confirming sign up:', err);
      // Type check for error object
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'string') {
        setError(err);
      } else {
        setError('An unexpected error occurred during confirmation.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Apply the formContainer class
    <div className={formStyles.formContainer}>
      {/* Apply the title class */}
      <h1 className={formStyles.title}>Sign Up</h1>
      {!needsConfirmation ? (
        <form onSubmit={handleSignUp}>
          {/* Apply inputGroup class */}
          <div className={formStyles.inputGroup}>
            {/* Apply label class */}
            <label htmlFor="email" className={formStyles.label}>Email:</label>
            {/* Apply inputField class (or rely on global styles) */}
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className={formStyles.inputField} // Optional if global is enough
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
            {isLoading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleConfirmation}>
          {/* Apply infoText class */}
          <p className={formStyles.infoText}>A confirmation code has been sent to {email}. Please enter it below.</p>
          <div className={formStyles.inputGroup}>
            <label htmlFor="confirmCode" className={formStyles.label}>Confirmation Code:</label>
            <input
              type="text"
              id="confirmCode"
              value={confirmCode}
              onChange={(e) => setConfirmCode(e.target.value)}
              required
              disabled={isLoading}
              className={formStyles.inputField} // Optional
            />
          </div>
          {error && <p className={formStyles.errorMessage}>{error}</p>}
          <button type="submit" disabled={isLoading} className={formStyles.submitButton}>
            {isLoading ? 'Confirming...' : 'Confirm Sign Up'}
          </button>
        </form>
      )}
      {/* Apply linkText class */}
      <p className={formStyles.linkText}>
        Already have an account? <Link href="/login">Sign In</Link>
      </p>
    </div>
  );
}