# Local Development Scripts

This directory contains bash scripts for local database management.

## Available Scripts

### 1. `reset-db.sh` - Full Database Reset

Drops the local database and recreates it with all migrations and seeders.

**⚠️ WARNING:** This will DELETE ALL local data!

**Usage:**

```bash
./scripts/local/reset-db.sh
```

**What it does:**

1. Prompts for confirmation
2. Drops the existing database
3. Creates a new empty database
4. Runs all migrations
5. Runs all seeders

**Configuration:**
Edit the script to change database settings:

```bash
DB_NAME="stone_erp_v2"
DB_USER="root"
DB_PASSWORD=""  # Add password if needed
```

---

### 2. `migrate.sh` - Run Migrations Only

Runs pending migrations without dropping the database.

**Usage:**

```bash
./scripts/local/migrate.sh
```

**What it does:**

- Runs `npm run migrate:all`
- Applies any pending migrations to your local database
- Preserves existing data

---

### 3. `seed.sh` - Run Seeders Only

Runs all seeders without migrations.

**Usage:**

```bash
./scripts/local/seed.sh
```

**What it does:**

- Runs `npm run seed:all`
- Inserts seed data into your local database
- Does not drop or recreate tables

---

## Common Workflows

### Starting Fresh (Clean Database)

```bash
./scripts/local/reset-db.sh
```

### After Pulling New Migrations

```bash
./scripts/local/migrate.sh
```

### After Adding New Seeders

```bash
./scripts/local/seed.sh
```

### Testing with Fresh Data

```bash
./scripts/local/reset-db.sh
npm run dev
```

---

## Database Configuration

These scripts use the following defaults:

- **Database Name:** `stone_erp_v2`
- **Database User:** `root`
- **Database Password:** (empty)
- **MySQL Command:** `mysql` (assumes MySQL/MariaDB in PATH)

### Using MariaDB Instead of MySQL

If you're using MariaDB, the scripts should work as-is since MariaDB uses the same client command. However, if you need to use `mariadb` command specifically, edit the scripts and replace:

```bash
mysql -u "$DB_USER" -e "..."
```

with:

```bash
mariadb -u "$DB_USER" -e "..."
```

### Using Different Database Credentials

If your local setup uses different credentials:

1. Open `scripts/local/reset-db.sh`
2. Modify the configuration section:
   ```bash
   DB_NAME="your_database_name"
   DB_USER="your_username"
   DB_PASSWORD="your_password"
   ```

---

## Troubleshooting

### Permission Denied

```bash
chmod +x scripts/local/*.sh
```

### MySQL Command Not Found

Make sure MySQL/MariaDB is installed and in your PATH:

```bash
# macOS (Homebrew)
brew install mysql
# or
brew install mariadb

# Ubuntu/Debian
sudo apt-get install mysql-client
# or
sudo apt-get install mariadb-client
```

### Access Denied for User

Check your database credentials:

```bash
mysql -u root -p
# Enter your password when prompted
```

If you need to set a password in the script, edit `reset-db.sh` and add your password to the `DB_PASSWORD` variable.

### Database Connection Error

Make sure your database server is running:

```bash
# macOS (Homebrew MySQL)
brew services start mysql

# macOS (Homebrew MariaDB)
brew services start mariadb

# Ubuntu/Debian
sudo service mysql start
# or
sudo service mariadb start
```

---

## Notes

- These scripts are for **local development only**
- Do NOT run these on production or staging servers
- Always backup important data before running reset
- The reset script requires confirmation before proceeding
- Scripts exit on any error (`set -e`)

---

## Package.json Scripts

Make sure your `package.json` has these scripts defined:

```json
{
  "scripts": {
    "migrate:all": "npx sequelize-cli db:migrate",
    "seed:all": "npx sequelize-cli db:seed:all",
    "initialize:db": "npm run migrate:all && npm run seed:all"
  }
}
```
