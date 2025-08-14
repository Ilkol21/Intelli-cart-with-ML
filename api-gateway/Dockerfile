# Етап 1: Збірка (Build)
FROM node:18-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Етап 2: Продакшн (Production)
FROM node:18-alpine

WORKDIR /usr/src/app

# Копіюємо тільки необхідні файли для запуску
COPY package*.json ./
RUN npm install --only=production

# Копіюємо збірку з попереднього етапу
COPY --from=build /usr/src/app/dist ./dist

# Запуск додатку
CMD ["node", "dist/main"]