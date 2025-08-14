# list-service/Dockerfile

# Етап 1: Збірка (Build)
FROM node:18-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
RUN npm install pg --save

COPY . .
RUN npm run build

# Етап 2: Продакшн (Production)
FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --only=production
RUN npm install pg --save 

COPY --from=build /usr/src/app/dist ./dist

CMD ["node", "dist/main"]
