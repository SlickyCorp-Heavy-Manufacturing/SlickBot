import * as captureWebsite from 'capture-website';
import { Message } from 'discord.js';
import fs from 'fs';
import { ICommand } from '../icommand';

export const SpyCommand: ICommand = {
  name: '!spy',
  helpDescription: 'Bot will respond with a box chart of spy',
  showInHelp: true,
  trigger: (msg: Message) => msg.content.startsWith('!spy'),
  command: async (msg: Message) => {
    await captureWebsite.file('https://finviz.com/map.ashx', 'screenshot.png', {
      width: 1200,
      height: 2000,
      element: 'canvas.chart',
      launchOptions: {
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
        ],
      },
    });

    await msg.channel.send({ files: ['screenshot.png'] });
    fs.unlink('screenshot.png', () => {});
  },
};

export const EtfCommand: ICommand = {
  name: '!etf',
  helpDescription: 'Bot will respond with a box chart of all etfs',
  showInHelp: true,
  trigger: (msg: Message) => msg.content.startsWith('!etf'),
  command: async (msg: Message) => {
    await captureWebsite.file('https://finviz.com/map.ashx?t=etf', 'screenshot.png', {
      width: 1200,
      height: 2000,
      element: 'canvas.chart',
      launchOptions: {
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
        ],
      },
    });

    await msg.channel.send({ files: ['screenshot.png'] });
    fs.unlink('screenshot.png', () => {});
  },
};
