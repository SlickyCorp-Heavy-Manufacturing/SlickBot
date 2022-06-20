import { Message } from 'discord.js';
import { ICommand } from '../icommand';
import { Meme } from './meme';
import { DrawMeme } from './draw-meme';

export const MemeCommand: ICommand = {
  name: '!meme',
  helpDescription: 'A way to impress your friends with memeology.\n\nSYNOPSIS\n\t!meme [--template "this do pigeon"]\n\t[--box1 "text box"] [--box2 "asdf"] [--box3 "asdf"]\n\nOPTIONS\n\t--template\n\t\tFuzzy searches for provided meme name\n\n\t--box{N}\n\t\tStarting with N=1, provide the text you want to display.\n\nHISTORY\n\n\t1990,1991 - Originally written by a bot on a hot and windy August afternoon.\n',
  showInHelp: true,
  trigger: (msg: Message) => msg.content.startsWith('!meme'),
  command: async (msg: Message) => {
    const value = await Meme.getImage(msg);
    await msg.reply(value);
  },
};

export const MemeSearchCommand: ICommand = {
  name: '!meme-search',
  helpDescription: '!meme-search --template "drake"',
  showInHelp: true,
  trigger: (msg: Message) => msg.content.startsWith('!meme-search'),
  command: async (msg: Message) => {
    const message = await Meme.getImage(msg);
    await msg.reply(message);
  },
};

export const DrawMemeCommand: ICommand = {
  name: '!meme-draw',
  helpDescription: '!meme-draw',
  showInHelp: true,
  trigger: (msg: Message) => msg.content.startsWith('!draw-meme'),
  command: async (msg: Message) => {
    await DrawMeme.meme(msg);
  },
};
