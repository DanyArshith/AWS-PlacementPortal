#!/bin/bash

# Zero-Downtime Deployment Script for EC2
# Make sure to run: chmod +x scripts/deploy.sh

# Exit on error
set -e

echo "=================================================="
echo "Starting Backend API Deployment: $(date)"
echo "=================================================="

# Define environment variables
BRANCH=${1:-main}
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$APP_DIR"
echo "Application directory: $APP_DIR"

# 1. Fetch latest changes from remote repository
echo "Fetching latest changes..."
git fetch origin

# 2. Check out target branch
echo "Checking out branch: $BRANCH..."
git checkout "$BRANCH"

# 3. Pull latest commits
echo "Pulling latest code changes..."
git pull origin "$BRANCH"

# 4. Create logs folder if it doesn't exist
if [ ! -d "logs" ]; then
  echo "Creating logs directory..."
  mkdir logs
fi

# 5. Install production dependencies
echo "Installing production dependencies..."
npm install --omit=dev --no-audit --no-fund

# 6. Run database seed (if requested via flags)
if [ "$2" == "--seed" ]; then
  echo "Seeding default database records..."
  node scripts/seedAdmin.js
fi

# 7. Reload PM2 processes gracefully
echo "Gracefully reloading PM2 processes (zero-downtime)..."
if npx pm2 describe placement-portal-backend > /dev/null 2>&1; then
  npx pm2 reload ecosystem.config.js --env production
else
  echo "Process not running in PM2. Starting application process..."
  npx pm2 start ecosystem.config.js --env production
fi

# 8. Save PM2 list so it persists across system reboots
echo "Saving PM2 process list..."
npx pm2 save

echo "=================================================="
echo "Deployment successfully completed!"
echo "=================================================="
