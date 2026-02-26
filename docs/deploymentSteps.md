## 1. Install Nginx

```
sudo yum install nginx -y
```

```
sudo systemctl start nginx
```

```
sudo systemctl enable nginx
```

## 2. Install Docker

```
sudo yum install docker -y
```

```
sudo systemctl start docker
```

```
sudo systemctl enable docker
```

## 3. Install MariaDB

```
sudo dnf install mariadb105-server -y
```

```
sudo systemctl start mariadb
```

```
sudo systemctl enable mariadb
```

## 4. create DB user

```
CREATE USER 'username'@'host' IDENTIFIED BY 'password';
```

```
GRANT ALL PRIVILEGES ON my_database.* TO 'app_user'@'localhost';
```

```
FLUSH PRIVILEGES;
```

## 5. set env file.

## 6. write nginx config file and then run.

```
sudo systemctl reload nginx
```

## 7. write CI/CD pipeline files in projects.

## 8. put secrets in github.

# **_Test_**
