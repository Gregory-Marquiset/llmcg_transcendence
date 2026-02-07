FROM node:20-alpine AS deps
WORKDIR /app
COPY services/gdpr/package*.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY services/gdpr/ ./gdpr/
COPY services/shared/ ./shared/

EXPOSE 5000
CMD ["node", "gdpr/gdprServer.js"]