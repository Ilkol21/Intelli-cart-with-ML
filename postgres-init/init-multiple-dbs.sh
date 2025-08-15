#!/bin/bash
set -e

# Використовуємо psql для виконання SQL-команд
# Створюємо бази даних, тільки якщо вони ще не існують
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    SELECT 'CREATE DATABASE lists_db'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'lists_db')\gexec
    SELECT 'CREATE DATABASE catalog_db'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'catalog_db')\gexec
EOSQL