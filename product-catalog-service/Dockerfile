# Етап 1: Збірка (Build)
FROM node:18-alpine AS build

# --- ВИПРАВЛЕННЯ ---
# Встановлюємо wget для healthcheck
RUN apk add --no-cache wget

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Етап 2: Продакшн (Production)
FROM node:18-alpine

# --- ВИПРАВЛЕННЯ ---
# Встановлюємо wget і в продакшн-образ
RUN apk add --no-cache wget

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --only=production

COPY --from=build /usr/src/app/dist ./dist

CMD ["node", "dist/main"]