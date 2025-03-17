#!/bin/bash

# PrivacyShield Deployment Script
# This script builds and deploys the PrivacyShield application

echo "🛡️ PrivacyShield Deployment Script 🛡️"
echo "--------------------------------------"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js before continuing."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2)
NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d '.' -f 1)
if [ $NODE_MAJOR_VERSION -lt 18 ]; then
    echo "❌ Node.js version $NODE_VERSION is not supported. Please use Node.js 18 or higher."
    exit 1
fi

echo "✅ Node.js version $NODE_VERSION detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run type checking
echo "🔍 Running type checking..."
npm run check

# Build the application
echo "🏗️ Building the application for production..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

echo "✅ Build completed successfully"

# Set environment variables
export NODE_ENV=production
export PORT=3000

# Start the application
echo "🚀 Starting PrivacyShield in production mode..."
echo "📡 The application will be available at http://localhost:$PORT"
npm start

# This script doesn't actually exit here because npm start keeps running