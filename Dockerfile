# 1. Base image with Node.js
FROM node:18-alpine AS base

# Create app directory
WORKDIR /app

# Install required packages for Prisma (SQLite + openssl)
RUN apk add --no-cache openssl sqlite

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy Prisma and source code
COPY ./src .

# Generate Prisma client
RUN DATABASE_URL="file:./buildbudget.db" npx prisma generate

# Push database schema to SQLite file
RUN DATABASE_URL="file:./buildbudget.db" npx prisma db push

# Build Next.js
RUN npm run build

# Expose port
EXPOSE 3000

# Start app with environment variables
ENV NODE_ENV=production
ENV PORT=3000

CMD ["npm", "start"]
