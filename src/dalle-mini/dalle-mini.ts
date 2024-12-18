import { Message, MessagePayload } from 'discord.js';
import got, { Response } from 'got';
import { ICommand } from '../icommand.js';

export const DalleCommand: ICommand = {
  name: '!dalle',
  helpDescription: 'Ask how to make a specific cocktail. e.g. `!cocktail Quick`',
  showInHelp: true,
  trigger: (msg: Message) => msg.content.startsWith('!dalle '),
  command: async (msg: Message) => {
    const prompt = msg.content.replace('!dalle ', '');

    let retryCounter = 0;
    let res: Response<string> | null = null;
    while (!res && retryCounter < 100) {
      try {
        res = await got.post('https://bf.dallemini.ai/generate', {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });
      } catch (e) {
        console.debug(e);
        retryCounter += 1;
      }
    }

    if (res) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const json: { images: string[] } = JSON.parse(res.body);
      const buffers = json.images.map((base64Img) => Buffer.from(base64Img, 'base64'));
      const msgReply = MessagePayload.create(msg.channel, { files: buffers });
      await msg.reply(msgReply);
    } else {
      await msg.reply('Unable to complete request at this time');
    }
  },
};
