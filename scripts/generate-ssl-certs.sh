#!/bin/bash

# Script to generate self-signed SSL certificates for development
# DO NOT use these certificates in production!

echo "🔒 Generating self-signed SSL certificates for development"
echo "WARNING: These certificates are for development only. Do not use in production!"

# Create ssl directory if it doesn't exist
mkdir -p ssl

# Generate private key
openssl genrsa -out ssl/privacyshield.key 2048

# Generate CSR
openssl req -new -key ssl/privacyshield.key -out ssl/privacyshield.csr -subj "/C=US/ST=State/L=City/O=PrivacyShield/CN=localhost"

# Generate self-signed certificate (valid for 365 days)
openssl x509 -req -days 365 -in ssl/privacyshield.csr -signkey ssl/privacyshield.key -out ssl/privacyshield.crt

# Set permissions
chmod 600 ssl/privacyshield.key
chmod 600 ssl/privacyshield.csr
chmod 600 ssl/privacyshield.crt

echo "✅ SSL certificates generated successfully in the ssl directory"
echo "📝 Files created:"
echo "  - ssl/privacyshield.key (private key)"
echo "  - ssl/privacyshield.csr (certificate signing request)"
echo "  - ssl/privacyshield.crt (self-signed certificate)"