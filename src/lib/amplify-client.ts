// src/lib/amplify-client.ts
import { Amplify } from 'aws-amplify';

/**
 * Configures the Amplify library with AWS resource details from environment variables.
 * This should be called once on the client-side when the application initializes.
 */
export function configureAmplifyClientSide() {
  console.log("Configuring Amplify client-side...");
  try {
    Amplify.configure({
      Auth: {
        Cognito: {
          // REQUIRED - Amazon Cognito User Pool ID
          userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '',

          // REQUIRED - Amazon Cognito Web Client ID (26-char alphanumeric string)
          userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '',

          // OPTIONAL - Enforce user authentication prior to accessing AWS resources or delay configuration
          // mandatorySignIn: true, // You might want to enable this based on your app's needs

          // OPTIONAL - Hosted UI configuration
          // oauth: {
          //   domain: 'your_cognito_domain',
          //   scope: ['phone', 'email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
          //   redirectSignIn: 'http://localhost:3000/',
          //   redirectSignOut: 'http://localhost:3000/logout',
          //   responseType: 'code' // or 'token', note that REFRESH token will only be generated when the responseType is code
          // }
        },
      },
      API: {
        REST: {
          // Define your API endpoint configuration here if using Amplify's API category
          // Example:
          // MyApiName: {
          //   endpoint: process.env.NEXT_PUBLIC_API_GATEWAY_URL || '',
          //   region: process.env.NEXT_PUBLIC_AWS_REGION
          // }
        }
      }
      // You can add other Amplify categories configuration here (API, Storage, etc.)
    }, { ssr: true }); // ssr: true is important for Next.js integration
    console.log("Amplify configured successfully.");
  } catch (error) {
    console.error("Error configuring Amplify:", error);
  }
}