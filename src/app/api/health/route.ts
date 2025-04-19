// src/app/api/health/route.ts
import { NextResponse } from 'next/server';

/**
 * Handles GET requests to the /api/health endpoint.
 * This endpoint is designed for health checks (e.g., by AWS App Runner).
 * It always returns a 200 OK status with a simple JSON body
 * without requiring authentication or performing complex logic.
 * @param _request - The incoming request object (not used in this simple handler).
 * @returns A NextResponse object with a JSON body and a 200 status code.
 */
export async function GET(_request: Request) {
  // Log that the health check endpoint was hit (optional, useful for debugging)
  console.log("Health check endpoint /api/health was called.");

  // Return a successful response with a simple JSON payload.
  // NextResponse.json() automatically sets the Content-Type to application/json
  // and defaults to a 200 status code.
  return NextResponse.json({ status: "ok", timestamp: Date.now() });
}

// You can optionally add handlers for other methods like POST, PUT, etc.
// if needed, but for a health check, only GET is typically required.