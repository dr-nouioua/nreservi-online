FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
# Force pnpm to approve the esbuild build script execution system-wide
ENV PNPM_SUPPORTED_ARCHITECTURES="linux-x64"
RUN corepack enable && pnpm config set allowed-built-dependencies esbuild

FROM base AS copy
WORKDIR /app
COPY . .

FROM base AS prod-deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc* ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc* ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM base
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/ . 

EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=production

CMD [ "pnpm", "start" ]
