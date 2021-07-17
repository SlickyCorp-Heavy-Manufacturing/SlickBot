import { Message } from 'discord.js';
import { ICommand } from '../icommand';
import { search } from './dictionary';

export const DefineCommand: ICommand = {
  name: '!define',
  helpDescription: 'Search the definition of a word',
  showInHelp: true,
  trigger: (msg: Message) => msg.content.startsWith('!define'),
  command: async (msg: Message) => {
    const word = msg.content.split(' ')[1];

    const results = await search(word);
    if (results.length <= 0) {
      msg.reply(`hmm... I'm not sure what ${word} means`);
      return;
    }

    let response = '';
    results.forEach((result) => {
      response += `\n**${result.word}**\n`;
      result.meanings.forEach((meaning, meaningIndex) => {
        if (meaningIndex >= 1) response += '\n';
        response += `_${meaning.partOfSpeech}_\n`;
        meaning.definitions.forEach((definition, index) => {
          response += `${index + 1}. ${definition.definition}\n`;
        });
      });
    });

    msg.reply(response);
  },
};
