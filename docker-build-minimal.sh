#!/bin/bash

# Script to build and run a minimal Docker container

echo "🐳 Building minimal Docker container..."

# Build using the minimal Dockerfile
docker build -f Dockerfile.minimal -t privacyshield-minimal:latest .

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed. Please fix the errors and try again."
    exit 1
fi

echo "✅ Docker build completed successfully!"

# Run the container
echo "🚀 Starting minimal container..."
docker run -d -p 3000:3000 --name privacyshield-minimal privacyshield-minimal:latest

if [ $? -ne 0 ]; then
    echo "❌ Docker run failed. Please fix the errors and try again."
    exit 1
fi

echo "✅ Minimal container started successfully!"
echo "🌐 The application is now running at http://localhost:3000"
echo "📊 You can view the logs with: docker logs privacyshield-minimal"
echo "🛑 To stop the container: docker stop privacyshield-minimal"