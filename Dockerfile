# ---- builder ----
FROM node:20-slim AS builder
WORKDIR /app

# Install system deps required by some build tools (optional but safe)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    build-essential \
  && rm -rf /var/lib/apt/lists/*

# copy package manifests to leverage cache
COPY package.json package-lock.json* ./

# install all dependencies (including dev) so prisma & build tools are available
RUN npm ci --no-audit --no-fund

# copy prisma schema early (so generating can use it) and source
COPY prisma ./prisma
COPY . .

# generate prisma client (this will create node_modules/@prisma/client)
# if your prisma schema is at a custom path use: npx prisma generate --schema=./prisma/schema.prisma
RUN npx prisma generate

# build next
RUN npm run build

# ---- runner ----
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# copy package manifests and install only production deps
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --no-audit --no-fund

# copy next build output and public folder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.* ./

# copy generated prisma client from builder into node_modules
# ensures the generated client is present even though we ran `npm ci --omit=dev` here
# note: if you installed @prisma/client as a dependency in package.json, this will overwrite with generated files
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
# (the .prisma folder may or may not exist; the COPY with || true is tolerated by build engines - if your builder doesn't have it this line can be removed)

# Expose and run
EXPOSE 3000
CMD ["npx", "next", "start", "-H", "0.0.0.0", "-p", "3000"]
