# Stage 1: Build the React + TypeScript frontend
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy all files and compile the production build
COPY . .
RUN npm run build

# Stage 2: Serve the compiled static assets with Nginx
FROM nginx:alpine

# Copy static build to Nginx public HTML directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration for single page app routing fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
