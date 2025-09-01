# Backend-specific Dockerfile
# Place this in apps/backend/Dockerfile

FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Build stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Type check and build
RUN npm run type-check
RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3101

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 backend-user

# Copy built application
COPY --from=builder --chown=backend-user:nodejs /app/dist ./dist
COPY --from=builder --chown=backend-user:nodejs /app/package*.json ./

# Install production dependencies only
RUN npm ci --only=production --legacy-peer-deps && npm cache clean --force

USER backend-user

EXPOSE 3101

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:3101/health').then(()=>process.exit(0)).catch(()=>process.exit(1))"

CMD ["node", "dist/main.js"]