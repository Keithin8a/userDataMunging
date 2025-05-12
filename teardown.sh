#!/bin/bash

echo "Dropping users Database"
sudo mysql -e "DROP DATABASE IF EXISTS \`users\`;"

echo "Database users has been dropped"