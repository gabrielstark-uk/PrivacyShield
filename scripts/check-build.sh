#!/bin/bash

# Script to check if the build was successful

echo "🔍 Checking build artifacts..."

# Check if dist directory exists
if [ ! -d "dist" ]; then
  echo "❌ dist directory does not exist!"
  exit 1
fi

# Check if dist directory is empty
if [ -z "$(ls -A dist)" ]; then
  echo "❌ dist directory is empty!"
  exit 1
fi

# Check if dist/index.js exists
if [ ! -f "dist/index.js" ]; then
  echo "❌ dist/index.js does not exist!"
  exit 1
fi

echo "✅ Build artifacts verified successfully!"
exit 0