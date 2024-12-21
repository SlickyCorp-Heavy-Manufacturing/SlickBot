#!/usr/bin/env bash

sudo apt update
sudo apt install --yes ffmpeg gnupg2 libatk1.0-0 libatk-bridge2.0-0 libcups2 libnss3 libxcomposite1 libxdamage1
npx --yes puppeteer browsers install chrome
