# Build stage
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npx expo export --platform web

# Production stage
FROM node:22-alpine AS runner
WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/serve.json ./serve.json

EXPOSE 3000
CMD ["serve", "dist", "-s", "-l", "3000"]