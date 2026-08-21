FROM node:22-alpine AS base
WORKDIR /app
RUN npm install -g npm@latest

FROM base AS dependencies
COPY package.json ./
# Changed npm ci to npm install so it doesn't look for a package-lock.json file
RUN npm install --include=dev

FROM base AS builder
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.output ./.output

EXPOSE 3000
CMD [ "node", ".output/server/index.mjs" ]
