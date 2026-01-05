FROM node:20-alpine AS build
WORKDIR /app

COPY conf/package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.25-alpine
COPY conf/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
