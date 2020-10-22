import { Message } from 'discord.js';
import fs from 'fs';
import got from 'got/dist/source';
import { withFile } from 'tmp-promise'

import { ICommand } from '../icommand';

export const SpyCommand: ICommand = {
  name: '!spy',
  helpDescription: 'Bot will respond with a box chart of spy',
  showInHelp: true,
  trigger: (msg: Message) => msg.content.startsWith('!spy'),
  command: async (msg: Message) => {
    await withFile(async (tmpFile) => {
      const response = await got.get('http://website-snapshot.centralus.azurecontainer.io:8080/spy', { responseType: 'buffer' });
      fs.writeFileSync(tmpFile.path, response.body);
      await msg.channel.send({ files: [tmpFile.path] });
    });
  },
};

export const EtfCommand: ICommand = {
  name: '!etf',
  helpDescription: 'Bot will respond with a box chart of all etfs',
  showInHelp: true,
  trigger: (msg: Message) => msg.content.startsWith('!etf'),
  command: async (msg: Message) => {
    await withFile(async (tmpFile) => {
      const response = await got.get('http://website-snapshot.centralus.azurecontainer.io:8080/etf', { responseType: 'buffer' });
      fs.writeFileSync(tmpFile.path, response.body);
      await msg.channel.send({ files: [tmpFile.path] });
    });
  },
};
