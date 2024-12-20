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

RUN apt update && \
  apt install --yes ffmpeg libnss3 && \
  apt-get clean autoclean && \
  apt-get autoremove --yes && \
  rm -rf /var/lib/{apt,dpkg,cache,log}/ && \
  npm ci --ignore-scripts --omit=dev && \
  npx --yes puppeteer browsers install chrome

COPY --from=build /app/dist ./dist

CMD ["node", "dist/index.js"]
