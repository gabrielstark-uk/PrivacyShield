#!/bin/bash

# Script to verify that all dependencies in package.json exist in the npm registry

echo "🔍 Verifying dependencies in package.json..."

# Extract dependencies from package.json
DEPS=$(node -e "const pkg = require('../package.json'); console.log(Object.keys(pkg.dependencies).join(' '))")
DEV_DEPS=$(node -e "const pkg = require('../package.json'); console.log(Object.keys(pkg.devDependencies).join(' '))")

# Function to check if a package version exists
check_package() {
  local package=$1
  local version=$(node -e "const pkg = require('../package.json'); console.log(pkg.dependencies['$package'] || pkg.devDependencies['$package'])")
  
  # Remove ^ or ~ from version
  version=${version#^}
  version=${version#~}
  
  echo "Checking $package@$version..."
  
  # Use npm view to check if the package version exists
  if npm view $package@$version version &> /dev/null; then
    echo "✅ $package@$version exists"
    return 0
  else
    echo "❌ $package@$version does not exist"
    
    # Get the latest version
    latest=$(npm view $package version 2>/dev/null)
    if [ $? -eq 0 ]; then
      echo "   Latest version is $latest"
    else
      echo "   Package $package does not exist in npm registry"
    fi
    
    return 1
  fi
}

# Check all dependencies
echo "Checking dependencies..."
FAILED=0
for dep in $DEPS; do
  if ! check_package $dep; then
    FAILED=1
  fi
done

echo "Checking dev dependencies..."
for dep in $DEV_DEPS; do
  if ! check_package $dep; then
    FAILED=1
  fi
done

if [ $FAILED -eq 1 ]; then
  echo "❌ Some dependencies have version issues. Please fix them in package.json."
  exit 1
else
  echo "✅ All dependencies verified successfully!"
  exit 0
fi