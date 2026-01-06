# ---- deps stage (prod deps only) ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY services/auth/package*.json ./
RUN npm ci --omit=dev

# ---- runtime stage ----
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production

# node_modules depuis deps
COPY --from=deps /app/node_modules ./node_modules

# code
COPY services/auth/ ./auth/
COPY services/shared/ ./shared/

WORKDIR /app/auth
CMD ["node", "authServer.js"]
