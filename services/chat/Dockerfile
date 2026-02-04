FROM node:20-alpine AS deps
WORKDIR /app
COPY services/chat/package*.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules

COPY services/chat/ ./chat/
COPY services/shared/ ./shared/

WORKDIR /app/chat
CMD ["node", "chatServer.js"]
