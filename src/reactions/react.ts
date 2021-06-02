import { Message } from 'discord.js';
import { ICommand } from '../icommand';

export const NiceReaction: ICommand = {
  name: 'nice reaction',
  helpDescription: '',
  showInHelp: false,
  trigger: (msg: Message) => new RegExp('\\b69\\b').test(msg.content),
  command: async (msg: Message) => {
    await msg.react('🇳');
    await msg.react('🇮');
    await msg.react('🇨');
    await msg.react('🇪');
  },
};

export const ChulasRecation: ICommand = {
  name: 'Chulas reaction',
  helpDescription: '',
  showInHelp: false,
  trigger: (msg: Message) => msg.author.username === 'chulas',
  command: async (msg: Message) => {
    await msg.react('🤦‍♂️');
  },
};

export const GroupReaction: ICommand = {
  name: 'Group reaction',
  helpDescription: '',
  showInHelp: false,
  trigger: (msg: Message) => msg.channel.id === '619704904696594493',
  command: async (msg: Message) => {
    const groupA = await msg.guild.roles.fetch('849368883689291776', false, true);
    if (groupA.members.some((member) => member.user.id === msg.author.id)) {
      await msg.react('A');
    } else {
      const groupB = await msg.guild.roles.fetch('849368974083883038', false, true);
      if (groupB.members.some((member) => member.user.id === msg.author.id)) {
        await msg.react('B');
      }
    }
  },
};
