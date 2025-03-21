#!/bin/bash

# Script to check if the build was successful

echo "🔍 Checking build artifacts..."

# Print current directory and list files
echo "Current directory: $(pwd)"
echo "Files in current directory:"
ls -la

# Check if dist directory exists
if [ ! -d "dist" ]; then
  echo "❌ dist directory does not exist!"
  exit 1
else
  echo "✅ dist directory exists"
fi

# List files in dist directory
echo "Files in dist directory:"
ls -la dist || echo "Failed to list files in dist directory"

# Check if dist directory is empty
if [ -z "$(ls -A dist 2>/dev/null)" ]; then
  echo "❌ dist directory is empty!"
  exit 1
else
  echo "✅ dist directory is not empty"
fi

# Check if dist/index.js exists
if [ ! -f "dist/index.js" ]; then
  echo "❌ dist/index.js does not exist!"
  # Try to find index.js in any subdirectory
  echo "Searching for index.js in dist directory:"
  find dist -name "index.js" || echo "No index.js found in dist directory"
  exit 1
else
  echo "✅ dist/index.js exists"
fi

echo "✅ Build artifacts verified successfully!"
exit 0