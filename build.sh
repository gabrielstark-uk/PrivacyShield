#!/bin/bash

# Production build script for PrivacyShield

set -e  # Exit immediately if a command exits with a non-zero status

echo "🚀 Starting PrivacyShield production build..."

# Check for required environment variables
if [ -z "$NODE_ENV" ]; then
  echo "⚠️  NODE_ENV not set, defaulting to production"
  export NODE_ENV=production
fi

# Install server dependencies
echo "📦 Installing server dependencies..."
npm ci --production

# Build client
echo "🔨 Building client application..."
cd client
npm ci --production
npm run build
cd ..

# Run database migrations if DB_MIGRATE is set
if [ "$DB_MIGRATE" = "true" ]; then
  echo "🗄️  Running database migrations..."
  npm run db:migrate
fi

# Initialize database if DB_INIT is set
if [ "$DB_INIT" = "true" ]; then
  echo "🗄️  Initializing database..."
  npm run db:init
fi

echo "✅ Build completed successfully!"
echo "🌐 To start the application, run: npm start"