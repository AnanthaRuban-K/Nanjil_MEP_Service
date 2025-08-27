FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/
RUN npm install

FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npx nx build frontend --prod

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist/apps/frontend ./dist/apps/frontend
EXPOSE 3100
CMD ["npx", "serve", "-s", "dist/apps/frontend", "-l", "3100"]
