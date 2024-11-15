import { Message, TextChannel } from 'discord.js';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const translate = require('moji-translate');

import { ICommand } from '../icommand.js';

export const EmojifyCommand: ICommand = {
  name: '!emojify',
  helpDescription: 'Repost the previous message with emojis',
  showInHelp: true,
  trigger: (msg: Message) => msg.content.startsWith('!emojify'),
  command: async (msg: Message) => {
    const previousMessage = (await msg.channel.messages.fetch({
      before: msg.id,
      limit: 1,
    })).last();

    if (previousMessage !== undefined && msg.content.trim() !== '') {
      const emojified: string = translate.translate(previousMessage.content, false);
      if (previousMessage.content.toLowerCase() !== emojified.toLowerCase()) {
        (msg.channel as TextChannel).send(emojified);
      }
    }
  },
};
