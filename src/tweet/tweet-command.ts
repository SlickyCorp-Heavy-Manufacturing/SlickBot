import { Message } from 'discord.js';

import { ICommand } from '../icommand';
import { TweetGen } from './tweet-generator';

const messageRegex = /^!tweet\s+(?<handle>\w+)\s+(?<text>.+)/gims;

export const TweetCommand: ICommand = {
  name: '!tweet',
  helpDescription: 'Bot will respond with a tweet from given twitter user',
  showInHelp: true,
  trigger: (msg: Message) => msg.content.startsWith('!tweet'),
  command: async (msg: Message) => {
    msg.channel.send(`\`\`\`javascript\n${JSON.stringify(messageRegex.exec(msg.content))}\`\`\``);
    const { groups: { handle, text } } = messageRegex.exec(msg.content);
    msg.channel.send(`\`\`\`javascript\n${JSON.stringify({ handle, text })}\`\`\``);

    await TweetGen.tweet(msg, {
      nickname: handle,
      text,
      retweets: Math.floor(Math.random() * (12345 - 0 + 1) + 0),
      retweetsWithComments: Math.floor(Math.random() * (1234 - 0 + 1) + 0),
      likes: Math.floor(Math.random() * (12345 - 0 + 1) + 0),
    });
  },
};
