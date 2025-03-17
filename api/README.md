# API Directory

This directory contains the API implementation for the PrivacyShield application.

## Files

- `index.ts` - Main Express API implementation
- `mock-api.js` - Mock API implementation for development and testing
- `redirect.js` - Handles redirects from legacy endpoints
- `vercel.json` - Vercel deployment configuration

## API Routes

- `/api/*` - Main API endpoints (served by `index.ts`)
- `/mock-api/*` - Mock API endpoints for testing (served by `mock-api.js`)
- `/api-legacy/*` - Legacy API redirects (served by `redirect.js`)

## Development

During development, you can use either:

1. The main Express API (`index.ts`) which connects to your backend services
2. The mock API (`mock-api.js`) which provides static responses for testing

## Deployment

When deploying to Vercel, all APIs are available, but the main routes point to the Express implementation.

## Important Note

**Do not create or use files named `index.js` in this directory!**

Due to Vercel's build process, having both `index.js` and `index.ts` in the same directory causes conflicts. The original `index.js` file was moved to `mock-api.js` to resolve this issue.

If you need to add new API functionality:
- Add it to `index.ts` for the main API
- Add it to `mock-api.js` for the mock API
- Use different filenames that don't conflict with existing ones