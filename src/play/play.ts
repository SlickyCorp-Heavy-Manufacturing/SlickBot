/* eslint no-bitwise: ["error", { "allow": ["<<"] }] */
import * as yargs from 'yargs';
import { Message } from 'discord.js';

import ytdl from 'discord-ytdl-core';

export class Play {
  static currentStream: any;

  public static async getTrack(msg: Message): Promise<String> {
    if (msg.channel.type === 'dm') Promise.resolve('Don\'t !play with your DMs.');

    const args = yargs
      .number('volume').number('v')
      .options({
        url: { type: 'string', default: 'https://youtu.be/dQw4w9WgXcQ' },
        volume: { type: 'number', alias: 'v', default: '100' },
      }).parse(msg.content);

    // If the url is provided as the last arg (without --url), use that
    if (yargs.argv._.length > 1) {
      args.url = yargs.argv._.pop();
    }

    if (!(args.url.startsWith('https://')
        && (args.url.includes('youtube.com') || args.url.includes('youtu.be'))
    )) {
      return Promise.resolve(`${args.url} is not a dank enough beat, try again.`);
    }

    const voiceChannel = msg.member.voice.channel;
    if (!voiceChannel) {
      return Promise.resolve('Join a voice channel, Dumas!');
    }

    voiceChannel.join().then(async (connection) => {
      const stream = ytdl(args.url, {
        filter: 'audioonly',
        highWaterMark: 1 << 25,
        opusEncoded: true,
      });

      // Kill the current stream, if it exists
      if (Play.currentStream) {
        console.log('Destroying current stream');
        Play.currentStream.destroy();
      }
      Play.currentStream = stream;

      // Kill the stream if the bot is disconnected before the end of the stream
      connection.on('disconnect', (err) => {
        if (stream) {
          console.log('Disconnected, destroying stream');
          stream.destroy(err);
        }
      });

      const dispatcher = connection.play(stream, { type: 'opus' });
      dispatcher.setVolumeLogarithmic(args.v / 100);
      dispatcher.on('error', console.error);
      dispatcher.on('finish', () => voiceChannel.leave());
    });

    return Promise.resolve(`🎶 Slickyboi started playing: ${args.url} 🎶`);
  }
}
