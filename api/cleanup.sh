#!/bin/bash

# This script removes the conflicting index.js file
# Run this script before deploying to Vercel

echo "Checking for conflicting files..."

if [ -f "index.js" ]; then
  echo "Found conflicting file: index.js"
  echo "Removing index.js to avoid conflicts with index.ts"
  rm index.js
  echo "File removed successfully"
else
  echo "No conflicting files found"
fi

echo "Cleanup complete"