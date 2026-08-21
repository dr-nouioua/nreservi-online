FROM node:22-alpine
WORKDIR /app

# 1. Copy all project configuration files
COPY package.json ./

# 2. Install dependencies cleanly via native npm (Bypasses all pnpm strict blocks)
RUN npm install

# 3. Copy the rest of your application code
COPY . .

# 4. Compile the TanStack Start full-stack web application code
RUN npm run build

EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=production

CMD [ "npx", "vinxi", "start", "--host", "0.0.0.0", "--port", "3000" ]
