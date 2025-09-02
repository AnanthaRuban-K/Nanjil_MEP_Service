# Multi-stage build for monorepo
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy root package.json and install workspace dependencies
COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/
COPY apps/backend/package*.json ./apps/backend/

# Install all dependencies (root + workspaces)
RUN npm ci --legacy-peer-deps --include-workspace-root

# Build backend
FROM base AS backend-builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules
COPY apps/backend ./apps/backend
COPY package*.json ./

# Build backend with proper workspace setup
WORKDIR /app/apps/backend
RUN npm run build

# Build frontend  
FROM base AS frontend-builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/frontend/node_modules ./apps/frontend/node_modules
COPY apps/frontend ./apps/frontend
COPY package*.json ./

# Build frontend
WORKDIR /app/apps/frontend
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# Production stage - Backend
FROM base AS backend-runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 backend-user

# Copy built backend
COPY --from=backend-builder --chown=backend-user:nodejs /app/apps/backend/dist ./dist
COPY --from=backend-builder --chown=backend-user:nodejs /app/apps/backend/package*.json ./

# Install only production dependencies
COPY --from=deps --chown=backend-user:nodejs /app/node_modules ./node_modules

USER backend-user
EXPOSE 3101
CMD ["node", "dist/main.js"]