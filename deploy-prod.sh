#!/bin/bash

# PrivacyShield Production Deployment Script
# This script builds and deploys the PrivacyShield application in production mode

echo "🛡️ PrivacyShield Production Deployment Script 🛡️"
echo "-----------------------------------------------"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker before continuing."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose before continuing."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2)
NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d '.' -f 1)
if [ $NODE_MAJOR_VERSION -lt 20 ]; then
    echo "❌ Node.js version $NODE_VERSION is not supported. Please use Node.js 20 or higher."
    exit 1
fi

echo "✅ Docker, Docker Compose, and Node.js v$NODE_VERSION detected"

# Check if .env file exists, if not create it from example
if [ ! -f ".env" ]; then
    echo "⚠️ No .env file found. Creating from .env.example..."
    cp .env.example .env
    echo "⚠️ Please update the .env file with your actual configuration values."
    echo "⚠️ Press Enter to continue or Ctrl+C to abort and edit the .env file first."
    read
fi

# Ensure required environment variables are set
if [ -z "$SESSION_SECRET" ]; then
    echo "⚠️ SESSION_SECRET environment variable is not set."
    echo "⚠️ Generating a random SESSION_SECRET..."
    export SESSION_SECRET=$(openssl rand -hex 32)
    echo "export SESSION_SECRET=$SESSION_SECRET" >> .env
fi

if [ -z "$DB_PASSWORD" ]; then
    echo "⚠️ DB_PASSWORD environment variable is not set."
    echo "⚠️ Generating a random DB_PASSWORD..."
    export DB_PASSWORD=$(openssl rand -hex 16)
    echo "export DB_PASSWORD=$DB_PASSWORD" >> .env
fi

# Check if SSL certificates exist, if not generate them
if [ ! -f "ssl/privacyshield.crt" ] || [ ! -f "ssl/privacyshield.key" ]; then
    echo "⚠️ SSL certificates not found. Generating self-signed certificates..."
    mkdir -p ssl
    npm run generate-ssl
    echo "⚠️ Self-signed certificates generated. For production, replace these with real certificates."
    echo "⚠️ Press Enter to continue or Ctrl+C to abort."
    read
fi

# Create logs directory
mkdir -p logs/nginx

# Create necessary directories
mkdir -p migrations dist

# Fix dependencies and generate lockfile
echo "🔧 Fixing dependencies..."
npm run fix-deps

echo "🔒 Generating lockfile..."
npm run generate-lockfile

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🏗️ Building the application for production..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

# Check if the build was successful
echo "🔍 Checking build artifacts..."
npm run check-build

if [ $? -ne 0 ]; then
    echo "❌ Build verification failed. Please fix the errors and try again."
    exit 1
fi

echo "✅ Build completed successfully"

# Build and start the Docker containers
echo "🏗️ Building Docker containers..."
docker-compose -f docker-compose.prod.yml build

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed. Please fix the errors and try again."
    exit 1
fi

echo "✅ Docker build completed successfully"

# Run database migrations
echo "🔄 Running database migrations..."
docker-compose -f docker-compose.prod.yml run --rm app sh -c "npx drizzle-kit push"

if [ $? -ne 0 ]; then
    echo "⚠️ Database migrations may have failed. Check the output above."
    echo "⚠️ Press Enter to continue or Ctrl+C to abort."
    read
fi

# Initialize database with default data
echo "🔄 Initializing database with default data..."
docker-compose -f docker-compose.prod.yml run --rm -e ADMIN_EMAIL=${ADMIN_EMAIL:-admin@privacyshield.com} -e ADMIN_PASSWORD=${ADMIN_PASSWORD:-$(openssl rand -hex 12)} app sh -c "npm run db:init"

if [ $? -ne 0 ]; then
    echo "⚠️ Database initialization may have failed. Check the output above."
    echo "⚠️ Press Enter to continue or Ctrl+C to abort."
    read
fi

# Start the application
echo "🚀 Starting PrivacyShield in production mode..."
docker-compose -f docker-compose.prod.yml up -d

if [ $? -ne 0 ]; then
    echo "❌ Failed to start Docker containers. Please check the logs."
    exit 1
fi

echo "✅ PrivacyShield is now running in production mode"
echo "📡 The application should be available at https://your-domain.com"
echo ""
echo "📋 Useful commands:"
echo "  - View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "  - Stop application: docker-compose -f docker-compose.prod.yml down"
echo "  - Restart application: docker-compose -f docker-compose.prod.yml restart"
echo ""
echo "🔒 PrivacyShield production deployment completed successfully!"

# Display admin credentials if they were generated
if [ -n "$ADMIN_PASSWORD" ] && [ "$ADMIN_PASSWORD" != "Admin123!" ]; then
    echo ""
    echo "🔑 Admin credentials:"
    echo "  - Email: ${ADMIN_EMAIL:-admin@privacyshield.com}"
    echo "  - Password: $ADMIN_PASSWORD"
    echo ""
    echo "⚠️ Please save these credentials securely and change the password after first login."
fi