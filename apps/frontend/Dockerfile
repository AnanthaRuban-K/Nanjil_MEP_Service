# 1. Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY nx.json ./
COPY workspace.json ./
COPY apps/frontend ./apps/frontend
COPY libs ./libs

# Install dependencies
RUN npm install

# Build Next.js frontend
RUN npm run build --workspace=frontend

# 2. Production stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/dist/apps/frontend ./

EXPOSE 3000

CMD ["npx", "next", "start", "-p", "3100"]
