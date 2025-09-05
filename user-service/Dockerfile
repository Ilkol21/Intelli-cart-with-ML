# user-service/Dockerfile

# Етап 1: Встановлення залежностей
FROM composer:2 as vendor

WORKDIR /app
COPY database/ database/
COPY composer.json composer.json
COPY composer.lock composer.lock
RUN composer install --ignore-platform-reqs --no-interaction --no-plugins --no-scripts --prefer-dist

# Етап 2: Створення основного образу PHP
FROM php:8.2-fpm-alpine as app

# Встановлюємо залежності для розробки PostgreSQL
RUN apk add --no-cache postgresql-dev

# Встановлення розширень для Laravel
RUN docker-php-ext-install pdo pdo_pgsql

# Копіювання коду додатку
WORKDIR /var/www/html
COPY . .

# Копіювання залежностей з попереднього етапу
COPY --from=vendor /app/vendor/ vendor/

RUN chown -R www-data:www-data storage bootstrap/cache && \
    chmod -R 775 storage bootstrap/cache

# Запуск PHP-FPM процесу
CMD ["php-fpm"]
