#!/bin/bash

# Script to generate a package-lock.json file

echo "🔒 Generating package-lock.json file..."

# Generate package-lock.json
npm install --package-lock-only

echo "✅ package-lock.json generated successfully!"