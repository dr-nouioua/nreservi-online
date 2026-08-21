FROM node:22-alpine
WORKDIR /app

# 1. Enable native node package manager layout tracking
RUN corepack enable

# 2. Copy dependency descriptors and run fresh npm installation
COPY package.json package-lock.json* ./
RUN npm install

# 3. Copy application codebase and bundle files
COPY . .
RUN npm run build

EXPOSE 3000
# Force the global runtime variables across the network interfaces
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production

CMD [ "node", ".output/server/index.mjs" ]
