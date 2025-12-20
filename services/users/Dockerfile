FROM node:20

WORKDIR /app

COPY services/users/package*.json ./
RUN npm install

COPY services/users/ ./users/
COPY services/shared/ ./shared/

WORKDIR /app/users


EXPOSE 5000
ENV HOST=0.0.0.0 PORT=5000

CMD ["node", "usersServer.js"]