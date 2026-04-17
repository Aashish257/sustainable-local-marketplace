# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copy only production dependencies and source from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src

# Create logs directory
RUN mkdir logs

EXPOSE 5000

ENV NODE_ENV=production

CMD ["npm", "start"]
