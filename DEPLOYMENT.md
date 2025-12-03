# Deployment Guide

This guide explains how to deploy the Stone CRM Backend application to the production server.

## Prerequisites

1. SSH access to the server configured with the alias `warrdel`
2. SSH key authentication set up (no password prompt)
3. Bash shell on your local machine

### SSH Configuration

Make sure you have the server configured in your `~/.ssh/config` file:

```
Host warrdel
    HostName your-server-ip-or-domain
    User your-username
    IdentityFile ~/.ssh/your-private-key
    Port 22
```

## Deployment Scripts

Two deployment scripts are provided:

### 1. `deploy.sh` - Standard Deployment

Use this for normal deployments when you want to keep existing data.

**What it does:**

- ✅ Pulls latest code from Git
- ✅ Installs/updates dependencies
- ✅ Runs database migrations
- ✅ Restarts PM2 process

**Commands:**

```bash
# Make executable (first time only)
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### 2. `deploy-fresh-db.sh` - Fresh Database Deployment

Use this when you want to start with a clean database.

**⚠️ WARNING:** This will **DELETE ALL EXISTING DATA**!

**What it does:**

- ✅ Pulls latest code from Git
- ✅ Installs/updates dependencies
- ⚠️ Drops the existing database
- ⚠️ Creates a new empty database
- ✅ Runs migrations AND seeders (full initialization)
- ✅ Restarts PM2 process

**Commands:**

```bash
# Make executable (first time only)
chmod +x deploy-fresh-db.sh

# Run fresh deployment (will prompt for confirmation)
./deploy-fresh-db.sh
```

You will be prompted to type `yes` to confirm the database drop.

## Server Configuration

The scripts use the following server configuration:

- **Server Alias:** `warrdel`
- **App Directory:** `/var/www/html/be-stonecrm.warrdelstones.com/stone-crm-be-app/`
- **Database Name:** `stone_erp_v2`
- **PM2 Process ID:** `1`

## Deployment Workflow

### For Regular Updates (with data preservation)

```bash
# 1. Commit and push your changes to Git
git add .
git commit -m "Your commit message"
git push origin v2-dev

# 2. Run the deployment script from your local machine
./deploy.sh
```

### For Fresh Start (drops all data)

```bash
# 1. Commit and push your changes to Git
git add .
git commit -m "Your commit message"
git push origin v2-dev

# 2. Run the fresh database deployment script
./deploy-fresh-db.sh

# 3. Type 'yes' when prompted to confirm
```

## Troubleshooting

### SSH Connection Issues

If you get SSH connection errors:

```bash
# Test your SSH connection
ssh warrdel

# If it asks for a password, set up SSH key authentication:
ssh-copy-id warrdel
```

### Permission Denied

If you get "Permission denied" errors:

```bash
# Make sure the scripts are executable
chmod +x deploy.sh deploy-fresh-db.sh

# Verify SSH access
ssh warrdel "whoami"
```

### Database Errors

If migrations fail:

```bash
# SSH into the server manually
ssh warrdel

# Navigate to the app directory
cd /var/www/html/be-stonecrm.warrdelstones.com/stone-crm-be-app/

# Check migration status
npx sequelize-cli db:migrate:status

# Undo last migration if needed
npx sequelize-cli db:migrate:undo

# Or undo all migrations
npx sequelize-cli db:migrate:undo:all

# Re-run migrations
pnpm run migrate:all
```

### PM2 Process Issues

If PM2 restart fails:

```bash
# Check PM2 processes
ssh warrdel "pm2 list"

# Check logs
ssh warrdel "pm2 logs 1"

# Restart manually
ssh warrdel "pm2 restart 1"
```

## Manual Deployment

If you prefer to deploy manually:

```bash
# 1. SSH into the server
ssh warrdel

# 2. Navigate to app directory
cd /var/www/html/be-stonecrm.warrdelstones.com/stone-crm-be-app/

# 3. Pull latest changes
sudo git pull

# 4. Install dependencies
sudo pnpm i

# 5. Run migrations (for normal deployment)
pnpm run migrate:all

# OR run full initialization (for fresh DB deployment)
# First drop and create database in MariaDB:
sudo mariadb
# > DROP DATABASE stone_erp_v2;
# > CREATE DATABASE stone_erp_v2;
# > exit;
pnpm run initialize:db

# 6. Restart PM2
pm2 restart 1

# 7. Check status
pm2 status
pm2 logs 1
```

## Rollback

If you need to rollback a deployment:

```bash
# SSH into the server
ssh warrdel

cd /var/www/html/be-stonecrm.warrdelstones.com/stone-crm-be-app/

# Checkout previous commit
sudo git log --oneline  # Find the commit hash
sudo git checkout <previous-commit-hash>

# Run migrations down if needed
npx sequelize-cli db:migrate:undo

# Restart
pm2 restart 1
```

## Environment Variables

Make sure the `.env` file on the server contains:

```env
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=stone_erp_v2
DB_PORT=3306
NODE_ENV=production
JWT_SECRET=your_jwt_secret
```

## Post-Deployment Checks

After deployment, verify:

1. **API Health:**

   ```bash
   curl https://be-stonecrm.warrdelstones.com/api/health
   ```

2. **PM2 Status:**

   ```bash
   ssh warrdel "pm2 status"
   ```

3. **Application Logs:**

   ```bash
   ssh warrdel "pm2 logs 1 --lines 50"
   ```

4. **Database Connection:**
   ```bash
   ssh warrdel "cd /var/www/html/be-stonecrm.warrdelstones.com/stone-crm-be-app && pnpm run test-db"
   ```

## Notes

- Always test changes in development before deploying to production
- The `deploy-fresh-db.sh` script includes a safety prompt to prevent accidental data loss
- Both scripts will exit on any error (`set -e`)
- All commands run on the remote server, not locally
- The scripts show verbose output so you can track progress

## Support

If you encounter issues:

1. Check the PM2 logs: `ssh warrdel "pm2 logs 1"`
2. Check the application logs
3. Verify database connectivity
4. Ensure all environment variables are set correctly
