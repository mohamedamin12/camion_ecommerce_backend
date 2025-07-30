FROM node:current-alpine3.22 AS builder

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json* ./

# Copy shared dependencies
COPY shared/ ./shared/

# Copy the specific service source code
COPY apps/cart-service/ ./apps/cart-service/

# Install dependencies
RUN npm install

# Build the specific service
RUN npm run build cart-service

# Production stage
FROM node:current-alpine3.22
WORKDIR /app

# Copy only production dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/apps/cart-service ./dist

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

EXPOSE 3003

CMD ["node", "dist/main.js"]