FROM node:20-alpine AS deps
WORKDIR /app
COPY services/auth/package*.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS runtime
RUN apk add curl
WORKDIR /app

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules

COPY services/auth/ ./auth/
COPY services/shared/ ./shared/

WORKDIR /app/auth
CMD ["node", "authServer.js"]
