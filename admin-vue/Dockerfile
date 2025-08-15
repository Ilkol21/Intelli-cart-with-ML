# admin-vue/Dockerfile

# Етап 1: Збірка (Build)
# --- ОСТАТОЧНЕ ВИПРАВЛЕННЯ ---
# Використовуємо Node.js версії 20, як вказано в package.json
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

# Встановлюємо залежності, ігноруючи потенційні конфлікти
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Етап 2: Продакшн (Production)
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]