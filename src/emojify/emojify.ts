import { Message } from 'discord.js';
// @ts-ignore
import * as translate from 'moji-translate';

import { ICommand } from '../icommand';

export const EmojifyCommand: ICommand = {
  name: '!emojify',
  helpDescription: 'Repost the previous message with emojis',
  showInHelp: true,
  trigger: (msg: Message) => msg.content.startsWith('!emojify'),
  command: async (msg: Message) => {
    const previousMessage = (await msg.channel.messages.fetch(
      { before: msg.id, limit: 1 },
      false,
      false,
    )).first();

    if (previousMessage !== undefined && msg.content.trim() !== '') {
      const emojified: string = translate.translate.translate(previousMessage.content, false);
      if (previousMessage.content.toLowerCase() !== emojified.toLowerCase()) {
        msg.channel.send(emojified);
      }
    }
  },
};
