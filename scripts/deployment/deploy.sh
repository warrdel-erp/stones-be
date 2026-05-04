#!/bin/bash

# Deployment script for Stone CRM Backend
# This script automates deployment to the production server
# Usage: ./deploy.sh

set -e  # Exit on any error

echo "======================================"
echo "Stone CRM Backend Deployment"
echo "======================================"
echo ""

# Server configuration
SERVER_USER="support"
SERVER_HOST="13.235.224.206"
SERVER_PORT="44084"
APP_DIR="/var/www/html/be-stonecrm.warrdelstones.com/stone-crm-be-app"
PM2_PROCESS_ID="0"

echo "📡 Connecting to server: $SERVER_USER@$SERVER_HOST:$SERVER_PORT"
echo ""

# Execute deployment commands on remote server
ssh -p "$SERVER_PORT" "$SERVER_USER@$SERVER_HOST" bash << ENDSSH
set -e

# Define variables on remote server
APP_DIR="$APP_DIR"

echo "📂 Navigating to application directory..."
cd \$APP_DIR

echo ""
echo "🔄 Pulling latest changes from Git..."
sudo git pull

echo ""
echo "📦 Installing dependencies..."
sudo pnpm i

echo ""
echo "🗄️  Running database migrations..."
pnpm run migrate:all

echo ""
echo "🔄 Restarting PM2 process..."
pm2 restart $PM2_PROCESS_ID

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "📊 PM2 Status:"
pm2 status

ENDSSH

echo ""
echo "======================================"
echo "✅ Deployment Successful!"
echo "======================================"

