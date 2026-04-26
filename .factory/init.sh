#!/bin/bash
set -e

cd /Users/skarnz/g1000-portal-1

# Install dependencies (idempotent)
npm install

# Verify .env.local exists
if [ ! -f .env.local ]; then
  echo "ERROR: .env.local not found. Copy from .env.example and fill in values."
  exit 1
fi

# Kill any stale dev server on port 3000
lsof -ti :3000 | xargs kill -9 2>/dev/null || true

echo "Init complete. Ready for development."
