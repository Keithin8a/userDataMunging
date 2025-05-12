#!/bin/bash

if ! command -v mysql
then
    echo "MySQL not found, installing"

    sudo apt-get update
    sudo sudo apt-get install -y mysql-server

    echo "MySQL installed"
fi

sudo service mysql start

echo "Creating users Database"
sudo mysql -e "CREATE DATABASE IF NOT EXISTS \`users\`;"

echo "Importing dump file"
sudo mysql "users" < "./files/users.sql"

echo "Creating user for node"
sudo mysql -p users -e "CREATE USER IF NOT EXISTS 'node_user'@'localhost' IDENTIFIED BY 'your_password';"

echo "Granting Priviliges"
sudo mysql -p users -e "GRANT SELECT ON users.* TO 'node_user'@'localhost';"

echo "applying Priviliges"
sudo mysql -p users -e "FLUSH PRIVILEGES;"

echo "Database users created"
