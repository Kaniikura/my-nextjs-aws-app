import { NextResponse } from 'next/server';

// This function handles GET requests to /api/config
export async function GET() {
  // Read environment variables on the server at runtime
  const config = {
    cognitoUserPoolId: process.env.COGNITO_USER_POOL_ID,
    cognitoClientId: process.env.COGNITO_CLIENT_ID,
    apiGatewayUrl: process.env.API_GATEWAY_URL,
  };

  if (!config.cognitoUserPoolId || !config.cognitoClientId || !config.apiGatewayUrl) {
    console.error('Runtime configuration for Amplify is missing!');
    return NextResponse.json({ error: 'Server configuration is incomplete.' }, { status: 500 });
  }

  return NextResponse.json(config);
}