#!/bin/bash

# Script to fix dependency issues in package.json

echo "🔧 Fixing dependency issues in package.json..."

# Create a backup of the original package.json
cp package.json package.json.bak

# Use the fixed package.json if it exists
if [ -f "package.json.fixed" ]; then
    echo "📄 Using package.json.fixed..."
    cp package.json.fixed package.json
else
    echo "⚠️ package.json.fixed not found. Fixing specific dependencies..."

    # Fix specific dependencies with known issues
    npx json -I -f package.json -e "this.dependencies['@jridgewell/trace-mapping'] = '^0.3.25'"
    npx json -I -f package.json -e "this.dependencies['@neondatabase/serverless'] = '^0.10.4'"
    npx json -I -f package.json -e "this.dependencies['lucide-react'] = '^0.303.0'"
    npx json -I -f package.json -e "this.dependencies['@replit/vite-plugin-shadcn-theme-json'] = '^0.0.4'"
    npx json -I -f package.json -e "this.dependencies['react'] = '^18.2.0'"
    npx json -I -f package.json -e "this.dependencies['react-dom'] = '^18.2.0'"
    npx json -I -f package.json -e "this.dependencies['react-hook-form'] = '^7.49.3'"
    npx json -I -f package.json -e "this.dependencies['@hookform/resolvers'] = '^3.3.1'"
    npx json -I -f package.json -e "this.dependencies['@tanstack/react-query'] = '^5.17.19'"

    # Fix dev dependencies with known issues
    npx json -I -f package.json -e "this.devDependencies['@types/react'] = '^18.2.15'"
    npx json -I -f package.json -e "this.devDependencies['@types/react-dom'] = '^18.2.7'"
    npx json -I -f package.json -e "this.devDependencies['tailwindcss'] = '^3.3.3'"
fi

echo "✅ Dependencies fixed successfully!"
echo "Original package.json saved as package.json.bak"