# ===============================
# Stage 1 - Builder
# ===============================
FROM oven/bun:1 AS builder

WORKDIR /app

COPY package.json bun.lockb* ./
RUN bun install

COPY . .

RUN bunx prisma generate
RUN bun run build

# ===============================
# Stage 2 - Production
# ===============================
FROM oven/bun:1

RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

ENV NODE_ENV=production

COPY package.json bun.lockb* ./
RUN bun install --production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/generated ./src/generated

EXPOSE 3000

CMD ["bun", "run", "start:prod"]

