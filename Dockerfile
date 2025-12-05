# Build Stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Give Node more memory for TypeScript compilation (googleapis types are huge)
RUN NODE_OPTIONS="--max-old-space-size=2048" npm run build

# Production Stage
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY --from=builder /app/dist ./dist
# Copy data to dist/data so the server can find it relative to execution path
COPY --from=builder /app/src/data ./dist/data

EXPOSE 3000
CMD ["npm", "start"]
