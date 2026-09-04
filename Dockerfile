# Stage 1: Install dependencies & compile tools for C++ modules (sqlite3)
FROM node:20.19-alpine AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Build Next.js application
FROM node:20.19-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Runner stage
FROM node:20.19-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV DATABASE_PATH="/data/bantugrow.db"

# Create persistence directory for SQLite with appropriate node permission
RUN mkdir -p /data && chown -R node:node /data
VOLUME /data

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/content ./content

RUN chown -R node:node /app

USER node
EXPOSE 3000
CMD ["npm", "run", "start"]
