#!/usr/bin/env bash

sudo apt update
sudo apt install --yes ffmpeg gnupg2 libnss3
npx --yes puppeteer browsers install chrome
