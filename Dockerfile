#Build stage
FROM node:20 AS build

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

RUN npm run build

#Production stage
FROM node:20 AS production

WORKDIR /app

COPY package*.json .

RUN npm ci --only=production

COPY --from=build /app/dist ./dist

CMD ["node", "dist/index.js"]

LABEL org.opencontainers.image.source=https://github.com/SlickyCorp-Heavy-Manufacturing/SlickBot
LABEL org.opencontainers.image.description="Discord bot that does important features"
