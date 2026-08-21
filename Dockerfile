FROM node:22-alpine
WORKDIR /app

# 1. Enable pnpm package management
RUN corepack enable

# 2. Hardcode the native build script approval variables (Bypasses pnpm block)
ENV PNPM_ONLY_BUILT_DEPENDENCIES=esbuild,sharp

# 3. Copy your project code context
COPY . .

# 4. Clean install all dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# 5. Compile the full-stack TanStack Start application framework code
RUN pnpm build

EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=production

CMD [ "pnpm", "start" ]
