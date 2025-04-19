'use client'; // Mark this component as a Client Component

import { Amplify } from 'aws-amplify';
import { useEffect, useState } from 'react';

/**
 * Fetches runtime configuration from the API and configures Amplify.
 * This component should be rendered early in the application lifecycle, e.g., in the root layout.
 */
export default function ConfigureAmplify() {
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    const fetchConfigAndConfigure = async () => {
      if (isConfigured) return; // Prevent reconfiguration

      try {
        console.log('Fetching runtime configuration for Amplify...');
        // Fetch configuration from the API route
        const response = await fetch('/api/config');
        if (!response.ok) {
          throw new Error(`Failed to fetch config: ${response.status} ${response.statusText}`);
        }
        const config = await response.json();

        // Check if the server returned an error object
        if (config.error) {
          throw new Error(`Failed to fetch config: ${config.error}`);
        }

        console.log('Runtime configuration received:', config);

        // Configure Amplify using the fetched runtime configuration
        Amplify.configure({
          Auth: {
            Cognito: {
              userPoolId: config.cognitoUserPoolId,
              userPoolClientId: config.cognitoClientId,
            }
          },
          API: {
            REST: {
              'MyApiName': {
                endpoint: config.apiGatewayUrl,
              }
            }
          },
        }, {
        });

        console.log('Amplify configured successfully.');
        setIsConfigured(true); // Mark Amplify as configured
      } catch (error) {
        console.error('Error configuring Amplify:', error);
      }
    };

    // Run the configuration function
    fetchConfigAndConfigure();

  }, [isConfigured]); // Dependency array includes isConfigured to prevent re-runs

  // This component doesn't render anything itself, it just configures Amplify.
  // You could optionally render a loading indicator or children based on `isConfigured`.
  return null;
}