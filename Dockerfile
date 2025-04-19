# Dockerfile
# Base image with Node.js
FROM node:22-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies only stage
FROM base AS deps
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Build stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Pass build-time environment variables needed for the build
# Note: NEXT_PUBLIC_ variables needed at RUNTIME should be set in App Runner service configuration,
#       but if any are needed during the `next build` process itself, pass them here.
# ARG NEXT_PUBLIC_EXAMPLE_VAR
# ENV NEXT_PUBLIC_EXAMPLE_VAR=$NEXT_PUBLIC_EXAMPLE_VAR

# Build the Next.js application
RUN npm run build # Or yarn build

# Production image stage
FROM base AS runner
WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production
# Optionally set hostname and port if needed, App Runner usually injects PORT
# ENV HOSTNAME=0.0.0.0
# ENV PORT=3000

# Copy necessary files from the builder stage
COPY --from=builder /app/public ./public
# Copy standalone output (recommended for smaller image size)
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

# Set the user to non-root
USER node

# Expose the port the app runs on (App Runner injects PORT env var)
EXPOSE 3000

# Command to run the application (using the standalone output)
CMD ["node", "server.js"]
