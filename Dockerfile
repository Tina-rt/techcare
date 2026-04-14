# --- STAGE 1: Build ---
FROM node:24.13-alpine AS builder

WORKDIR /app

# Copy configuration files
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY apps ./apps
COPY libs ./libs

# Build the specific app (will be passed as build arg)
ARG APP_NAME
RUN npm run build ${APP_NAME}

# --- STAGE 2: Runtime ---
FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy build output and migrations
ARG APP_NAME
COPY --from=builder /app/dist/apps/${APP_NAME} ./dist
COPY --from=builder /app/libs/database/drizzle ./libs/database/drizzle
COPY --from=builder /app/drizzle.config.ts ./

# Command to run the app
CMD ["node", "dist/main"]
