# Stage 1: Build the TypeScript server
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy tsconfig and source code
COPY tsconfig.json ./
COPY src ./src

# Build the application
RUN npm run build

# Create SQLite database directory
RUN mkdir -p /app/data

# Stage 2: Production image
FROM node:22-alpine

WORKDIR /app

# Install production dependencies only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy compiled JS files from builder stage
COPY --from=builder /app/dist ./dist

# Create persistent data directory for SQLite database & RSA keys
RUN mkdir -p /app/data

# Environment configuration defaults
ENV PORT=5000
ENV NODE_ENV=production
ENV DB_PATH=/app/data/docshield.db

EXPOSE 5000

CMD ["node", "dist/server.js"]
