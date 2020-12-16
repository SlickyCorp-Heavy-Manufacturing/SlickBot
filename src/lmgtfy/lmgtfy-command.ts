import { Message } from 'discord.js';
import { ICommand } from '../icommand';

export const LMGTFYCommand: ICommand = {
  name: 'lmgtfy',
  helpDescription: 'There are no stupid questions...',
  showInHelp: true,
  trigger: (msg: Message) => msg.cleanContent.startsWith('!lmgtfy'),
  command: async (msg: Message) => {
    msg.channel.messages.fetch({limit: 2}).then( messages => {
        const message = messages.last().cleanContent.replace(/\s/g, '+')
        msg.reply(`https://lmgtfy.app/?q=${message}`)
    })
  },
};
