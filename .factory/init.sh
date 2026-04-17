#!/bin/bash
set -e

cd /Users/skarnz/g1000-portal-1

# Install dependencies if needed
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules/.package-lock.json" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Verify .env.local exists
if [ ! -f ".env.local" ]; then
  echo "ERROR: .env.local not found. Copy .env.example and fill in values."
  exit 1
fi

echo "Environment ready."
