FROM node:20

WORKDIR /app

COPY services/auth/package*.json ./
RUN npm install

COPY services/auth/ ./auth/
COPY services/shared/ ./shared/

WORKDIR /app/auth

EXPOSE 5000
ENV HOST=0.0.0.0 PORT=5000

CMD ["node", "authServer.js"]