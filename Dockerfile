FROM node:22-alpine
WORKDIR /app

# 1. Enable corepack for node package management tracking
RUN corepack enable

# 2. Copy the entire repository layout directly
COPY . .

# 3. Use standard npm installation to bypass monorepo locks
RUN npm install

# 4. Force compile the TanStack application build natively
RUN npm run build

EXPOSE 3000
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

CMD [ "node", ".output/server/index.mjs" ]
