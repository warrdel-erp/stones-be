## Copy from server

```
scp -P 44084 support@13.235.224.206:/home/support/db_dump/univ_dump.sql ./Desktop/
```

## Others

```

docker run --add-host=host.docker.internal:host-gateway --env-file .env -p 6002:6002 univ-be


CREATE USER 'erpedvantage-production'@'172.17.0.1' IDENTIFIED BY '6CM_>Zdd0y_xx>4b4#84YKO&t';
GRANT ALL PRIVILEGES ON production_univeristy_db.* TO 'erpedvantage-production'@'172.17.0.1';
FLUSH PRIVILEGES;


docker exec -it university-erp-fe:uat-latest sh

mysql -u erpedvantage-production -p -h 172.17.0.1 production_univeristy_db


mariadb -u erpedvantage-production -p -h 172.17.0.1 production_univeristy_db


GRANT ALL PRIVILEGES ON production_univeristy_db.* TO 'erpedvantage-production'@'172.17.%' IDENTIFIED BY '6CM_>Zdd0y_xx>4b4#84YKO&t';



CREATE USER 'erpedvantage-production'@'172.17.0.1' IDENTIFIED BY '6CM_>Zdd0y_xx>4b4#84YKO&t' REQUIRE NONE;

GRANT ALL PRIVILEGES ON production_univeristy_db.* TO 'erpedvantage-production'@'172.17.0.1';
FLUSH PRIVILEGES;


sudo certbot --apache -d fe-stonecrm.warrdelstones.com
```

sudo certbot --apache -d stage.hiveerp.com

```
<VirtualHost *:80>
    ServerName be-stonecrm.warrdelstones.com
    ServerAlias be-stonecrm.warrdelstones.com
    DocumentRoot /var/www/html/be-stonecrm.warrdelstones.com
    ErrorLog /var/log/httpd/be-stonecrm.warrdelstones.com/error.log
    ProxyPass / http://13.235.224.206:6007/ connectiontimeout=5 timeout=30
    #CustomLog /var/log/httpd/be-stonecrm.warrdelstones.com/requests.log combined
    <Directory "/var/www/html/">
#    Options Includes  FollowSymLinks
Options -Indexes +FollowSymLinks -MultiViews
    AllowOverride All
    # Allow open access:
    Require all granted
</Directory>
#RewriteEngine on
#RewriteCond %{SERVER_NAME} =www.be-stonecrm.warrdelstones.com [OR]
#RewriteCond %{SERVER_NAME} =be-stonecrm.warrdelstones.com
#RewriteRule ^ https://%{SERVER_NAME}%{REQUEST_URI} [END,NE,R=permanent]
RewriteEngine on
RewriteCond %{SERVER_NAME} =be-stonecrm.warrdelstones.com
RewriteRule ^ https://%{SERVER_NAME}%{REQUEST_URI} [END,NE,R=permanent]
</VirtualHost>
```

ALTER TABLE students ROW_FORMAT=DYNAMIC;

## Stone deployment commands

1. If not refreshing DB

```
cd /var/www/html/be-stonecrm.warrdelstones.com/stone-crm-be-app/
sudo git pull
sudo pnpm i
pnpm run migrate:all
pm2 restart 1
```

2. If refreshing DB

```
sudo mariadb
drop database stone_erp_v2;
create database stone_erp_v2;
exit;
```

```
cd /var/www/html/be-stonecrm.warrdelstones.com/stone-crm-be-app/
sudo git pull
sudo pnpm i
pnpm run initialize:db
pm2 restart 1
```

## Automated Deployment

Two automated deployment scripts are available in the project root:

### Standard Deployment (with data preservation)

```bash
./deploy.sh
```

### Fresh Database Deployment (drops all data)

```bash
./deploy-fresh-db.sh
```

See `DEPLOYMENT.md` for detailed instructions.

```

## University deployment commands for staging

```

sudo mariadb

```

```

use stage_univeristy_db;

```

```

use production_univeristy_db;

```

```

cd /var/www/html/bestage.hiveerp.com/university-erp-be/
sudo git pull
sudo npm i
pm2 restart 0

```

## University deployment commands for production

```

cd ~/temp-univ-be/university-erp-be/
sudo git pull
sudo npm i
npm run docker:build
docker stop univ-be
docker rm univ-be
npm run docker:run

```

```
