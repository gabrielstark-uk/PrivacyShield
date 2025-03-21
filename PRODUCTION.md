# PrivacyShield Production Deployment Guide

This guide provides instructions for deploying the PrivacyShield application to a production environment.

## Prerequisites

- Node.js 16+ and npm
- PostgreSQL 13+
- A Stripe account for payment processing
- A secure domain with SSL certificate

## Environment Setup

1. Clone the repository to your production server
2. Copy `.env.example` to `.env` and configure all required environment variables:
   ```
   cp .env.example .env
   nano .env
   ```
3. Make sure to set `NODE_ENV=production` in your environment

## Critical Environment Variables

- `SESSION_SECRET`: A strong, unique secret for session encryption
- `STRIPE_SECRET_KEY`: Your Stripe secret key (starts with `sk_live_`)
- `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook signing secret
- `DATABASE_URL`: Connection string for your PostgreSQL database

## Database Setup

1. Create a PostgreSQL database:
   ```
   createdb privacy_shield
   ```

2. Run the database migrations:
   ```
   npm run db:migrate
   ```

3. Initialize the database with default data:
   ```
   npm run db:init
   ```

## Building for Production

1. Install dependencies:
   ```
   npm install --production
   ```

2. Build the client:
   ```
   cd client
   npm install --production
   npm run build
   ```

## Running in Production

We recommend using PM2 or a similar process manager:

1. Install PM2:
   ```
   npm install -g pm2
   ```

2. Start the application:
   ```
   pm2 start npm --name "privacy-shield" -- start
   ```

3. Configure PM2 to start on system boot:
   ```
   pm2 startup
   pm2 save
   ```

## Stripe Webhook Configuration

1. In your Stripe dashboard, create a webhook endpoint pointing to:
   ```
   https://your-domain.com/api/webhook
   ```

2. Configure the webhook to listen for these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

3. Copy the webhook signing secret to your `.env` file.

## Security Considerations

1. Ensure your server has a firewall configured
2. Set up regular database backups
3. Configure SSL/TLS for your domain
4. Keep all dependencies updated regularly:
   ```
   npm audit
   npm update
   ```

## Monitoring

1. Set up application monitoring with PM2:
   ```
   pm2 monitor
   ```

2. Consider implementing additional monitoring solutions like Sentry or New Relic

## Troubleshooting

If you encounter issues with subscription plans not appearing:
1. Check the server logs for errors
2. Use the admin endpoint to initialize plans:
   ```
   curl -X POST https://your-domain.com/api/admin/initialize-plans \
     -H "Content-Type: application/json" \
     -H "Cookie: your-session-cookie" 
   ```

## Support

For production support issues, please contact the development team.