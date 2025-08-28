# Stage 3: Production image
FROM node:20-alpine AS runner
WORKDIR /app

# Copy built frontend
COPY --from=builder /app/dist/apps/frontend ./dist/apps/frontend

# Install serve
RUN npm install -g serve

# Change port to 3100
EXPOSE 3100

CMD ["serve", "-s", "dist/apps/frontend", "-l", "3100"]
