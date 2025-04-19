// src/components/ConfigureAmplify.tsx
'use client'; // Mark this component as a Client Component

import { useEffect } from 'react';
import { configureAmplifyClientSide } from '@/lib/amplify-client'; // Adjust path if necessary

// Call the configuration function
configureAmplifyClientSide();

/**
 * A client component responsible solely for ensuring Amplify is configured on the client-side.
 * It doesn't render any UI itself.
 */
export default function ConfigureAmplifyClientSide() {
  // This component doesn't need to render anything,
  // its purpose is to run the configuration logic in a client context.
  // Using useEffect ensures it runs after initial mount, though configureAmplifyClientSide()
  // is called at the top level here, which is also valid for client components.
  useEffect(() => {
     console.log("ConfigureAmplifyClientSide mounted, Amplify should be configured.");
  }, []);

  return null; // Render nothing
}