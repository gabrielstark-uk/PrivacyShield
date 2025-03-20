#!/bin/bash

# Navigate to the project root directory
cd "$(dirname "$0")/.." || exit

# Run the script using tsx
npx tsx scripts/create-admin-user.ts