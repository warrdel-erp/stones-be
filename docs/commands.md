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
