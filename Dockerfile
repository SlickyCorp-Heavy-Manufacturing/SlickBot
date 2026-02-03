#Build stage
FROM docker.io/node:25.6.0 AS build

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

RUN npm run build

#Production stage
FROM docker.io/node:25.6.0 AS production

LABEL org.opencontainers.image.source=https://github.com/SlickyCorp-Heavy-Manufacturing/SlickBot
LABEL org.opencontainers.image.description="Discord bot that does important features"

WORKDIR /app

COPY package*.json .

RUN rm -rf /var/lib/{apt,dpkg,cache,log}/ && \
  npm ci --build-from-source --ignore-scripts --omit=dev && \
  npx --yes playwright install --with-deps chromium && \
  apt update && \
  apt install --yes ffmpeg && \
  apt-get clean autoclean && \
  apt-get autoremove --yes

COPY --from=build /app/dist ./dist

CMD ["node", "dist/index.js"]
