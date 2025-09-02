# Backend-specific Dockerfile
# Place this in apps/backend/Dockerfile

FROM node:18-alpine AS base

# -----------------------
# Dependencies stage
# -----------------------
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy monorepo root package.json + lock
COPY ../../package.json ../../package-lock.json ./

# Copy backend package.json (for workspace awareness)
COPY ./package.json ./apps/backend/package.json

# Install dependencies using root lockfile
RUN npm ci --legacy-peer-deps

# -----------------------
# Build stage
# -----------------------
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps
COPY --from=deps /app/node_modules ./node_modules

# Copy backend source
COPY . ./apps/backend

# Move into backend dir
WORKDIR /app/apps/backend

# Type check and build
RUN npm run type-check && npm run build

# -----------------------
# Runner stage
# -----------------------
FROM base AS runner
WORKDIR /app/apps/backend

ENV NODE_ENV=production
ENV PORT=3101

# Create non-root user
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 backend-user

# Copy built app and package.json
COPY --from=builder --chown=backend-user:nodejs /app/apps/backend/dist ./dist
COPY --from=builder --chown=backend-user:nodejs /app/apps/backend/package.json ./

# Copy production node_modules only
COPY --from=deps --chown=backend-user:nodejs /app/node_modules ./node_modules


# Use root package.json + lockfile
COPY ./package.json ./package-lock.json /app/
# Copy backend package.json also (for workspace awareness)
COPY ./apps/backend/package.json /app/apps/backend/
USER backend-user

EXPOSE 3101

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:3101/health').then(()=>process.exit(0)).catch(()=>process.exit(1))"

CMD ["node", "dist/main.js"]
