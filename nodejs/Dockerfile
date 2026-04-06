# ========================================
# Optimized Multi-Stage Dockerfile
# Node.js TypeScript Application
# ========================================

ARG NODE_VERSION=24.11.1-alpine
FROM node:${NODE_VERSION} AS base

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs && \
    chown -R nodejs:nodejs /app

# ========================================
# Dependencies Stage
# ========================================
FROM base AS deps

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    npm ci --omit=dev && \
    npm cache clean --force

# Set proper ownership
RUN chown -R nodejs:nodejs /app

# ========================================
# Build Dependencies Stage
# ========================================
FROM base AS build-deps

# Copy package files
COPY package*.json ./

# Install all dependencies with build optimizations
RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    npm ci --no-audit --no-fund && \
    npm cache clean --force

# Create necessary directories and set permissions
RUN mkdir -p /app/node_modules/.vite

# RUN chown -R nodejs:nodejs /app/node_modules /app/dist

# ========================================
# Build Stage
# ========================================
FROM build-deps AS build

# Copy only necessary files for building (respects .dockerignore)
COPY --chown=nodejs:nodejs . .

# Build the application
RUN npm run build

# Set proper ownership
RUN chown -R nodejs:nodejs /app && chmod -R 755 /app

# ========================================
# Development Stage
# ========================================
FROM build-deps AS development

ENV NODE_ENV=development \
    NPM_CONFIG_LOGLEVEL=warn

RUN apk add --no-cache su-exec g++

# Copy source files
COPY . .

# Ensure all directories have proper permissions
RUN mkdir -p /app/node_modules/.vite && \
    chown -R nodejs:nodejs /app/node_modules/.vite && \
    chmod -R 755 /app/node_modules/.vite && \
	mkdir -p /app/src/server/public/avatars

COPY --chown=nodejs:nodejs entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Ne pas mettre USER nodejs ici
EXPOSE 3000 5173 9229

ENTRYPOINT ["/entrypoint.sh"]

CMD ["npm", "run", "dev:docker"]

# ========================================
# Production Stage
# ========================================
ARG NODE_VERSION=24.11.1-alpine
FROM node:${NODE_VERSION} AS production
WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs && \
    chown -R nodejs:nodejs /app

RUN apk add --no-cache su-exec g++

ENV NODE_ENV=production \
    NODE_OPTIONS="--max-old-space-size=256 --no-warnings" \
    NPM_CONFIG_LOGLEVEL=silent

COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=nodejs:nodejs /app/package*.json ./
COPY --from=build --chown=nodejs:nodejs /app/dist ./dist

# Copy avatars folder to the correct location for the compiled code
COPY --chown=nodejs:nodejs src/server/public/avatars /app/dist/server/public/avatars

# Copy IA engine binary for move calculation
COPY --chown=nodejs:nodejs src/server/ia /app/dist/server/ia

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Pas de USER nodejs ici, c'est l'entrypoint qui fait le switch
EXPOSE 3000
ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "dist/server/index.js"]