#!/usr/bin/env bash

sudo apt update
sudo apt install --yes ffmpeg gnupg2
npx --yes playwright install --with-deps chromium
