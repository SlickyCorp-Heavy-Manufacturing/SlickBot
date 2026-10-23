# Build stage
FROM docker.io/node:26.12.1-trixie AS build

WORKDIR /app

COPY package*.json .

ARG TARGETARCH
RUN if [ "$TARGETARCH" = "arm64" ]; then \
    CFLAGS="-DOPUS_ARM_MAY_HAVE_NEON_INTR" npm install; \
  else \
    npm install; \
  fi

COPY . .

RUN npm run build

# Production stage
FROM docker.io/node:26.12.1-trixie AS production

LABEL org.opencontainers.image.source=https://github.com/SlickyCorp-Heavy-Manufacturing/SlickBot
LABEL org.opencontainers.image.description="Discord bot that does important features"

WORKDIR /app

COPY package*.json .

ARG TARGETARCH
RUN npm ci --build-from-source --ignore-scripts --omit=dev && \
  if [ "$TARGETARCH" = "arm64" ]; then \
    CFLAGS="-DOPUS_ARM_MAY_HAVE_NEON_INTR" npm rebuild --build-from-source @discordjs/opus; \
  else \
    npm rebuild --build-from-source @discordjs/opus; \
  fi

RUN rm -rf /var/lib/{apt,dpkg,cache,log}/ && \
  npx --yes playwright install --with-deps chromium && \
  apt update && \
  apt install --yes ffmpeg && \
  apt-get clean autoclean && \
  apt-get autoremove --yes

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/youtube-dl-exec/bin/yt-dlp ./node_modules/youtube-dl-exec/bin/yt-dlp

CMD ["node", "dist/index.js"]
