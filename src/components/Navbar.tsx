// src/components/Navbar.tsx
'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      // Hub listener handles state update, redirect is optional here
       router.push('/'); // Go to home after sign out
    } catch (error) {
      console.error('Error signing out from navbar: ', error);
    }
  };

  return (
    // Apply the navbar class from the CSS module
    <nav className={styles.navbar}>
      {/* Apply the navLinks class */}
      <div className={styles.navLinks}>
        <Link href="/">Home</Link>
        {/* Conditionally render dashboard link only if user is logged in */}
        {user && <Link href="/dashboard">Dashboard</Link>}
      </div>

      {/* Apply the authActions class */}
      <div className={styles.authActions}>
        {isLoading ? (
          <span>Loading...</span>
        ) : user ? (
          <>
            {/* Apply the userInfo class */}
            <span className={styles.userInfo}>Welcome, {user.username}</span>
            {/* Apply the logoutButton class */}
            <button onClick={handleSignOut} className={styles.logoutButton}>
              Sign Out
            </button>
          </>
        ) : (
          <>
            {/* Use the navLinks class for consistency or keep default button styles */}
            <Link href="/login">Login</Link>
            <Link href="/signup">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}