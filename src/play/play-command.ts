import { Message } from 'discord.js';
import { ICommand } from '../icommand.js';
import { Play } from './play.js';

export const PlayCommand: ICommand = {
  name: '!play',
  helpDescription: 'Noise for your noise holes.\n\nSYNOPSIS\n\t!play {url}\n\nHISTORY\n\n\t1990,1991 - Originally written by a bot on a hot and windy August afternoon.\n',
  showInHelp: true,
  trigger: (msg: Message) => msg.content.startsWith('!play '),
  command: async (msg: Message) => {
    await Play.playTrack(msg, false);
  },
};
