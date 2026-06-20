#!/bin/bash

# Rollback Script for EC2
# Make sure to run: chmod +x scripts/rollback.sh

# Exit on error
set -e

echo "=================================================="
echo "Starting Backend API Rollback: $(date)"
echo "=================================================="

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$APP_DIR"

# 1. Determine target commit
TARGET_COMMIT=${1:-"HEAD@{1}"}
echo "Rolling back to reference: $TARGET_COMMIT..."

# 2. Hard reset git tree to target commit
echo "Resetting code state..."
git reset --hard "$TARGET_COMMIT"
git clean -df

# 3. Re-install production dependencies (just in case they changed)
echo "Syncing production dependencies..."
npm install --omit=dev --no-audit --no-fund

# 4. Gracefully reload PM2 processes
echo "Gracefully reloading PM2 processes (zero-downtime)..."
npx pm2 reload ecosystem.config.js --env production

# 5. Save PM2 list
echo "Saving PM2 list..."
npx pm2 save

echo "=================================================="
echo "Rollback successfully completed!"
echo "Current Git status is now at: $(git rev-parse --short HEAD)"
echo "=================================================="
