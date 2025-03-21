FROM node:20-alpine as builder

WORKDIR /app

# Copy fixed package.json
COPY package.json.fixed ./package.json
COPY .npmrc ./

# Install dependencies (using npm install instead of npm ci since we don't have package-lock.json)
RUN npm install

# Copy the rest of the source code
COPY . .

# Create necessary directories
RUN mkdir -p migrations dist

# Build the application
RUN npm run build

# Check if the build was successful
RUN npm run check-build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY --from=builder /app/package.json /app/.npmrc ./

# Install production dependencies only
RUN npm install --omit=dev

# Create necessary directories
RUN mkdir -p dist migrations

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy migrations folder
COPY --from=builder /app/migrations ./migrations

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port
EXPOSE 3000

# Create a non-root user and switch to it
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Start the application
CMD ["node", "dist/index.js"]