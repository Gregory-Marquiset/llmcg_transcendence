FROM node:20-alpine AS deps
WORKDIR /app
COPY services/statistics/package*.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY services/statistics/ ./statistics/
COPY services/shared/ ./shared/

EXPOSE 5000
CMD ["node", "statisticsServer.js"]