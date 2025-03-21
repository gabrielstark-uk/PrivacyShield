#!/bin/bash

# Script to build Docker containers with the simple Dockerfile

echo "🐳 Building Docker containers with simplified Dockerfile..."

# Build using the simple Dockerfile
docker build -f Dockerfile.simple -t privacyshield:latest .

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed. Please fix the errors and try again."
    exit 1
fi

echo "✅ Docker build completed successfully!"
echo "🚀 You can now run the container with:"
echo "docker run -p 3000:3000 privacyshield:latest"