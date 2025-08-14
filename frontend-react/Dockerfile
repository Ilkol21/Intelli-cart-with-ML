# frontend-react/Dockerfile

# Етап 1: Збірка (Build)
# Використовуємо Node.js для компіляції нашого React-додатку
FROM node:18-alpine AS build

WORKDIR /app

# Копіюємо package.json та package-lock.json для встановлення залежностей
COPY package*.json ./
RUN npm install

# Копіюємо решту файлів проєкту
COPY . .

# Збираємо продакшн-версію додатку
RUN npm run build

# Етап 2: Продакшн (Production)
# Використовуємо легкий веб-сервер Nginx для роздачі статичних файлів
FROM nginx:alpine

# Копіюємо зібрані файли з попереднього етапу в папку, з якою працює Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Видаляємо стандартну конфігурацію Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Копіюємо нашу власну конфігурацію (ми створимо її на наступному кроці)
COPY nginx.conf /etc/nginx/conf.d

# Відкриваємо порт 80 для вхідних з'єднань
EXPOSE 80

# Запускаємо Nginx
CMD ["nginx", "-g", "daemon off;"]
