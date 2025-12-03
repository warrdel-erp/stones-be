#!/bin/bash

# Fresh database deployment script for Stone CRM Backend
# This script drops the existing database, creates a new one, and deploys
# WARNING: This will DELETE ALL existing data!
# Usage: ./deploy-fresh-db.sh

set -e  # Exit on any error

echo "======================================"
echo "Stone CRM Backend - Fresh DB Deployment"
echo "======================================"
echo ""
echo "⚠️  WARNING: This will DROP the existing database!"
echo "⚠️  ALL DATA WILL BE LOST!"
echo ""
read -p "Are you sure you want to continue? (type 'y' to confirm): " confirm

if [ "$confirm" != "y" ]; then
    echo "Deployment cancelled."
    exit 0
fi

echo ""
echo "Proceeding with fresh database deployment..."
echo ""

# Server configuration
SERVER_USER="support"
SERVER_HOST="13.235.224.206"
SERVER_PORT="44084"
APP_DIR="/var/www/html/be-stonecrm.warrdelstones.com/stone-crm-be-app"
DB_NAME="stone_erp_v2"
PM2_PROCESS_ID="1"

echo "📡 Connecting to server: $SERVER_USER@$SERVER_HOST:$SERVER_PORT"
echo ""

# Execute deployment commands on remote server
ssh -p "$SERVER_PORT" "$SERVER_USER@$SERVER_HOST" bash << ENDSSH
set -e

# Define variables on remote server
DB_NAME="$DB_NAME"
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
echo "🗑️  Dropping existing database: \$DB_NAME..."
sudo mariadb -e "DROP DATABASE IF EXISTS \$DB_NAME;"

echo ""
echo "🆕 Creating fresh database: \$DB_NAME..."
sudo mariadb -e "CREATE DATABASE \$DB_NAME;"

echo ""
echo "✅ Database recreated successfully!"

echo ""
echo "🗄️  Running migrations and seeders..."
pnpm run initialize:db

echo ""
echo "🔄 Restarting PM2 process..."
pm2 restart 1

echo ""
echo "✅ Fresh database deployment completed successfully!"
echo ""
echo "📊 PM2 Status:"
pm2 status

ENDSSH

echo ""
echo "======================================"
echo "✅ Fresh Database Deployment Successful!"
echo "======================================"

