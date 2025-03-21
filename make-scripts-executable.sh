#!/bin/bash

# Make all deployment scripts executable
chmod +x deploy.sh
chmod +x deploy-prod.sh
chmod +x scripts/generate-ssl-certs.sh
chmod +x scripts/update-dependencies.sh
chmod +x scripts/verify-dependencies.sh
chmod +x scripts/fix-dependencies.sh
chmod +x scripts/generate-lockfile.sh
chmod +x scripts/check-build.sh

echo "✅ All scripts are now executable"