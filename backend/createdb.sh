#!/bin/bash

# create a new database
echo "Creating database..."
createdb staffany

# create a new user with password
echo "Creating user..."
psql -c "CREATE USER staffany_admin WITH PASSWORD 'assignment';"

# grant privileges to the user
echo "Granting privileges..."
psql -c "GRANT ALL PRIVILEGES ON DATABASE staffany TO staffany_admin;"

echo "Database and user created successfully."
