#!/bin/sh
set -e

# Wait for Postgres to be ready
until PGPASSWORD=$POSTGRES_PASSWORD psql -h "db" -U "postgres" -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - executing command"

# Create User and Database if they don't exist
PGPASSWORD=$POSTGRES_PASSWORD psql -v ON_ERROR_STOP=1 -h "db" -U "postgres" <<EOF
DO
\$do\$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = '$APP_USER') THEN

      CREATE ROLE "$APP_USER" LOGIN PASSWORD '$APP_PASSWORD';
   END IF;
END
\$do\$;

SELECT 'CREATE DATABASE "$APP_DB"'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$APP_DB')\gexec

GRANT ALL PRIVILEGES ON DATABASE "$APP_DB" TO "$APP_USER";
ALTER DATABASE "$APP_DB" OWNER TO "$APP_USER";
EOF

echo "Database initialization completed successfully"
