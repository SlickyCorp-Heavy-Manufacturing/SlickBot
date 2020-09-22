import { Message } from 'discord.js';
import fs from 'fs';
import got from 'got/dist/source';
import { ICommand } from '../icommand';

export const SpyCommand: ICommand = {
  name: '!spy',
  helpDescription: 'Bot will respond with a box chart of spy',
  showInHelp: true,
  trigger: (msg: Message) => msg.content.startsWith('!spy'),
  command: async (msg: Message) => {
    const response = await got.get('https://website-snapshot.azurewebsites.net/spy', { responseType: 'text' });

    fs.writeFileSync('screenshot.png', response.body, { encoding: 'base64' });
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
    const response = await got.get('https://website-snapshot.azurewebsites.net/etf', { responseType: 'text' });

    fs.writeFileSync('screenshot.png', response.body, { encoding: 'base64' });
    await msg.channel.send({ files: ['screenshot.png'] });
    fs.unlink('screenshot.png', () => {});
  },
};
