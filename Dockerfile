FROM node:22-alpine
WORKDIR /app

# 1. Enable pnpm package management
RUN corepack enable

# 2. Copy ALL files (including .npmrc and package configurations) first
COPY . .

# 3. Clean install all dependencies matching your lockfile
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# 4. Compile the full-stack TanStack Start framework code
RUN pnpm build

EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=production

CMD [ "pnpm", "start" ]
