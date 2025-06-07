# Use Node Alpine as base image
FROM node:18-alpine

# Install build dependencies and gcc for code compilation
RUN apk add --no-cache \
    python3 \
    build-base \
    g++ \
    openjdk11 \
    && rm -rf /var/cache/apk/*

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app source
COPY . .

# Create necessary directories for compiler and set permissions
RUN mkdir -p Compiler/codes Compiler/inputs Compiler/outputs && \
    chmod 777 Compiler/codes Compiler/inputs Compiler/outputs && \
    chown -R node:node .

# Switch to non-root user
USER node

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-3000}/health || exit 1

# Start the application
CMD ["npm", "start"]
