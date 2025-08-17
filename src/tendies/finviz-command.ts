import { Message, TextChannel } from 'discord.js';
import { sample } from 'lodash-es';

import { ICommand } from '../icommand.js';
import Screenshot from '../screenshot/screenshot.js';

async function finvizScreenshot(map: string): Promise<Buffer> {
  return await Screenshot.get({
    clicks: [
      {
        selector: 'button:has-text("Fullscreen")',
      },
    ],
    selector: 'canvas.chart',
    url: `https://finviz.com/map.ashx?t=${map}`,
    viewportSize: { height: 1200, width: 1200 },
  });
}

export const SpyCommand: ICommand = {
  name: '!spy',
  helpDescription: 'Bot will respond with a box chart of spy',
  showInHelp: true,
  trigger: (msg: Message) => msg.content.startsWith('!spy'),
  command: async (msg: Message): Promise<void> => {
    await (msg.channel as TextChannel).send({
      files: [await finvizScreenshot('spy')],
    });
  },
};

export const DowCommand: ICommand = {
  name: '!dow',
  helpDescription: 'Bot will respond with Dow Jones Industrial Average',
  showInHelp: true,
  trigger: (msg: Message) => (msg.content.startsWith('!dow') || msg.content.startsWith('!dji')),
  command: async (msg: Message) => {
    await (msg.channel as TextChannel).send(sample([
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
  command: async (msg: Message): Promise<void> => {
    await (msg.channel as TextChannel).send({
      files: [await finvizScreenshot('etf')],
    });
  },
};

export const WorldCommand: ICommand = {
  name: '!world',
  helpDescription: 'Bot will respond with a box chart of worldly stocks',
  showInHelp: true,
  trigger: (msg: Message) => msg.content.startsWith('!world'),
  command: async (msg: Message): Promise<void> => {
    await (msg.channel as TextChannel).send({
      files: [await finvizScreenshot('geo')],
    });
  },
};
