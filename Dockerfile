#Build stage
FROM node:22 AS build

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

RUN npm run build

#Production stage
FROM node:22 AS production

LABEL org.opencontainers.image.source=https://github.com/SlickyCorp-Heavy-Manufacturing/SlickBot
LABEL org.opencontainers.image.description="Discord bot that does important features"

WORKDIR /app

COPY package*.json .

RUN npm ci --omit=dev && npx puppeteer browsers install firefox

COPY --from=build /app/dist ./dist

CMD ["node", "dist/index.js"]
