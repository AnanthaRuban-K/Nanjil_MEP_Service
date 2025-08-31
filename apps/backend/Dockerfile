# apps/backend/Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
# Install dependencies including devDependencies (needed for TypeScript build)
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the TypeScript application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3101

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hono

# Install only production dependencies
COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY --from=builder --chown=hono:nodejs /app/dist ./dist

# Create uploads directory for future file uploads
RUN mkdir -p /app/uploads && chown -R hono:nodejs /app/uploads

USER hono

EXPOSE 3101

CMD ["node", "dist/main.js"]