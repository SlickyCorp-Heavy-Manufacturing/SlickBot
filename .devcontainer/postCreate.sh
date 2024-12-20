#!/usr/bin/env bash

sudo apt update
sudo apt install --yes gnupg2 libasound2 libgtk-3-0 libx11-xcb1
npx --yes puppeteer browsers install firefox
