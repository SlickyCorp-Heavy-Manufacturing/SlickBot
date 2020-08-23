import { Message } from 'discord.js';
import got from 'got';
import { ICommand } from '../icommand';

function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const XKCDCommand: ICommand = {
  name: 'xkcd',
  helpDescription: 'Bot will post xkcd. or todays by appending today',
  showInHelp: true,
  trigger: (msg: Message) => msg.content.startsWith('!xkcd'),
  command: async (msg: Message) => {
    let xkcdLink: string;
    if (msg.content.includes('today')) {
      xkcdLink = 'https://xkcd.com/info.0.json';
    } else {
      const number = getRandomNumber(0, 2000);
      xkcdLink = `https://xkcd.com/${number}/info.0.json`;
    }
    const value = await got(xkcdLink, { responseType: 'json' });
    const image = (value.body as any).img;
    await msg.channel.send(image);
  },
};
