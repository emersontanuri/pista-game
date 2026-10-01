FROM node:22-bookworm-slim AS builder
WORKDIR /app

# better-sqlite3 is a native module. The slim image does not include the
# Python and C/C++ toolchain required by node-gyp when no prebuilt binary is
# available for the target environment.
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/node_modules ./node_modules
# Mantém o seed manual disponível no container sem executá-lo no startup.
COPY --from=builder /app/server ./server
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
