FROM node:current-alpine3.22 AS builder

WORKDIR /app

# 1. Copy ONLY the root package files
COPY package.json package-lock.json* ./

# 2. Install all dependencies once (from root)
RUN npm install

# 3. Copy ALL source code (including services)
COPY . .

RUN npm run nest-build

# Production stage
FROM node:current-alpine3.22
WORKDIR /app

# Copy only what's needed for production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

CMD ["node", "dist/apps/api-gateway/main"]