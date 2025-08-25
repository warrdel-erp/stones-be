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


sudo certbot --apache -d sso.erpedvantage.com
```
