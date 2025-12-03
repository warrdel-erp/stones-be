#!/bin/bash

# Local Database Reset Script
# This script drops the local database and recreates it with migrations and seeders
# WARNING: This will DELETE ALL local data!
# Usage: ./scripts/local/reset-db.sh

set -e  # Exit on any error

echo "======================================"
echo "Local Database Reset"
echo "======================================"
echo ""
echo "⚠️  WARNING: This will DROP the local database!"
echo "⚠️  ALL LOCAL DATA WILL BE LOST!"
echo ""
read -p "Are you sure you want to continue? (type 'y' to confirm): " confirm

if [ "$confirm" != "y" ]; then
    echo "Database reset cancelled."
    exit 0
fi

echo ""
echo "Proceeding with local database reset..."
echo ""

# Database configuration
DB_NAME="stone_erp"
DB_USER="root"  # Change if needed
DB_PASSWORD="rootroot"  # Add password if needed

echo "🗑️  Dropping existing database: $DB_NAME..."
if [ -z "$DB_PASSWORD" ]; then
    mysql -u "$DB_USER" -e "DROP DATABASE IF EXISTS $DB_NAME;"
else
    mysql -u "$DB_USER" -p"$DB_PASSWORD" -e "DROP DATABASE IF EXISTS $DB_NAME;"
fi

echo ""
echo "🆕 Creating fresh database: $DB_NAME..."
if [ -z "$DB_PASSWORD" ]; then
    mysql -u "$DB_USER" -e "CREATE DATABASE $DB_NAME;"
else
    mysql -u "$DB_USER" -p"$DB_PASSWORD" -e "CREATE DATABASE $DB_NAME;"
fi

echo ""
echo "✅ Database recreated successfully!"

echo ""
echo "🗄️  Running migrations and seeders..."
npm run initialize:db

echo ""
echo "======================================"
echo "✅ Local Database Reset Complete!"
echo "======================================"
echo ""
echo "You can now start your server with:"
echo "  npm run dev"

