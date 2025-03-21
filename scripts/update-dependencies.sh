#!/bin/bash

# Script to update dependencies to their latest versions

echo "🔄 Updating dependencies to their latest versions..."

# Check if npm-check-updates is installed
if ! command -v ncu &> /dev/null; then
    echo "📦 Installing npm-check-updates..."
    npm install -g npm-check-updates
fi

# Update all dependencies to their latest versions
echo "📊 Checking for updates..."
ncu -u

# Install updated dependencies
echo "📦 Installing updated dependencies..."
npm install

echo "✅ Dependencies updated successfully!"
echo ""
echo "🧪 It's recommended to run tests to ensure everything works with the updated dependencies:"
echo "npm test"
echo ""
echo "🚀 If everything works, commit the changes:"
echo "git add package.json package-lock.json"
echo "git commit -m \"chore: update dependencies to latest versions\""