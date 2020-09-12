import * as yargs from 'yargs';
import { Message } from 'discord.js';
const ytdl = require('ytdl-core-discord');

export class Play {
  public static async getTrack(msg: Message): Promise<String> {
    const args = yargs.options({
      url: { type: 'string', default: 'https://youtu.be/dQw4w9WgXcQ' },
    }).parse(msg.content);

    if (msg.channel.type === 'dm') Promise.resolve('Don\'t !play with your DM');

    const voiceChannel = msg.member.voice.channel;

    if (!voiceChannel) {
      return Promise.resolve('please join a voice channel first!');
    }

    voiceChannel.join().then(async (connection) => {
      const stream = await ytdl(args.url, { type: 'opus', filter: 'audioonly' });
      const dispatcher = connection.play(stream);

      //dispatcher.on("debug", console.log);
      dispatcher.on('error', console.error);

      dispatcher.on('finish', () => voiceChannel.leave());
    });

    return Promise.resolve(args.url);
  }
}
