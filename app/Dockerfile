# Build stage
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json .
RUN npm install --omit=dev

# Runtime stage — non-root, minimal surface
FROM node:22-alpine AS runtime
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY server.js .
COPY package.json .
USER appuser
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost:8080/healthz || exit 1
CMD ["node", "server.js"]
