import { Message } from 'discord.js';
import fs from 'fs';
import got from 'got/dist/source';
import { sample as _sample } from 'lodash';
import { withFile } from 'tmp-promise';

import { ICommand } from '../icommand';

export const SpyCommand: ICommand = {
  name: '!spy',
  helpDescription: 'Bot will respond with a box chart of spy',
  showInHelp: true,
  trigger: (msg: Message) => msg.content.startsWith('!spy'),
  command: async (msg: Message) => {
    await withFile(
      async (tmpFile) => {
        const response = await got.get(
          'https://website-snapshot.krischeonline.com/spy',
          {
            headers: {
              API_KEY: process.env.SNAPSHOT_API_TOKEN,
            },
            responseType: 'buffer',
          },
        );
        fs.writeFileSync(tmpFile.path, response.body);
        await msg.channel.send({ files: [tmpFile.path] });
      },
      { postfix: '.png' },
    );
  },
};

export const DowCommand: ICommand = {
  name: '!dow',
  helpDescription: 'Bot will respond with Dow Jones Industrial Average',
  showInHelp: true,
  trigger: (msg: Message) => msg.content.startsWith('!down'),
  command: async (msg: Message) => {
    await msg.channel.send(_sample([
      'https://tenor.com/bdkoy.gif',
      'https://tenor.com/bbCLu.gif',
      'https://tenor.com/beDbD.gif',
      'https://tenor.com/bgfS2.gif',
    ]));
  },
};

export const EtfCommand: ICommand = {
  name: '!etf',
  helpDescription: 'Bot will respond with a box chart of all etfs',
  showInHelp: true,
  trigger: (msg: Message) => msg.content.startsWith('!etf'),
  command: async (msg: Message) => {
    await withFile(
      async (tmpFile) => {
        const response = await got.get(
          'https://website-snapshot.krischeonline.com/etf',
          {
            headers: {
              API_KEY: process.env.SNAPSHOT_API_TOKEN,
            },
            responseType: 'buffer',
          },
        );
        fs.writeFileSync(tmpFile.path, response.body);
        await msg.channel.send({ files: [tmpFile.path] });
      },
      { postfix: '.png' },
    );
  },
};

export const WorldCommand: ICommand = {
  name: '!world',
  helpDescription: 'Bot will respond with a box chart worldly stocks',
  showInHelp: true,
  trigger: (msg: Message) => msg.content.startsWith('!world'),
  command: async (msg: Message) => {
    await withFile(
      async (tmpFile) => {
        const response = await got.get(
          'https://website-snapshot.krischeonline.com/world',
          {
            headers: {
              API_KEY: process.env.SNAPSHOT_API_TOKEN,
            },
            responseType: 'buffer',
          },
        );
        fs.writeFileSync(tmpFile.path, response.body);
        await msg.channel.send({ files: [tmpFile.path] });
      },
      { postfix: '.png' },
    );
  },
};
