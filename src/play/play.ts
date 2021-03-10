/* eslint no-bitwise: ["error", { "allow": ["<<"] }] */
import * as yargs from 'yargs';
import { Message, VoiceChannel } from 'discord.js';

import Soundcloud from 'soundcloud.ts';
import ytdl from 'discord-ytdl-core';

export class Play {
  private static currentlyPlaying = false;

  private static currentStream: any;

  private static queue: {(): void;}[] = [];

  public static async playTrack(msg: Message, playNow: boolean): Promise<void> {
    if (msg.channel.type === 'dm') {
      await msg.reply('Don\'t !play with your DMs.');
      return;
    }

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
        && (args.url.includes('youtube.com') || args.url.includes('youtu.be') || args.url.includes('soundcloud.com'))
    )) {
      await msg.reply(`${args.url} is not a dank enough beat, try again.`);
      return;
    }

    const voiceChannel = msg.member.voice.channel;
    if (!voiceChannel) {
      await msg.reply('Join a voice channel, Dumas!');
      return;
    }

    if (playNow) {
      this.startJamming(msg, voiceChannel, args.url, args.v);
    } else {
      const queuedTrackCallback = () => this.startJamming(msg, voiceChannel, args.url, args.v);
      this.queue.push(queuedTrackCallback);
      this.processQueue();
    }
  }

  private static async processQueue() {
    if (!this.currentlyPlaying && this.queue.length > 0) {
      const nextTrackCallback = this.queue.shift();
      nextTrackCallback();
    }
  }

  /**
   * Start jammin
   * @param msg The origenal message for the song request
   * @param voiceChannel  The channel to play the track in
   * @param url The track to play
   * @param volume The volume to play the track at
   */
  private static async startJamming(
    msg: Message,
    voiceChannel: VoiceChannel,
    url: string,
    volume: number,
  ): Promise<void> {
    this.currentlyPlaying = true;
    let stream: any;
    const clientId = 'ymSs5c4hxrRu3yuA6ZyOORoADJI2tVPD';
    const soundcloud = new Soundcloud(clientId);

    try {
      if (url.includes('soundcloud.com')) {
        stream = await soundcloud.util.streamTrack(url);
      } else {
        stream = ytdl(url, {
          filter: 'audioonly',
          highWaterMark: 1 << 25,
          opusEncoded: true,
        });
      }
    } catch (error) {
      await msg.reply(`Slickyboi pooped: ${error} 🎶`);
      return;
    }

    voiceChannel.join().then(async (connection) => {
      // Kill the current stream, if it exists
      if (Play.currentStream) {
        console.log('Destroying current stream');
        Play.currentStream.destroy();
        Play.currentStream = undefined;
      }
      Play.currentStream = stream;

      // Kill the stream if the bot is disconnected before the end of the stream
      connection.on('disconnect', (err) => {
        if (stream) {
          console.log('Disconnected, destroying stream');
          stream.destroy(err);
        }
      });

      let options = {};
      if (!url.includes('soundcloud.com')) {
        options = { type: 'opus' };
      }

      const dispatcher = connection.play(stream, options);
      dispatcher.setVolumeLogarithmic(volume / 100);
      dispatcher.on('error', console.error);
      dispatcher.on('finish', () => {
        voiceChannel.leave();
        this.currentlyPlaying = false;
        setTimeout(() => this.processQueue(), 100);
      });

      await msg.reply(`🎶 Slickyboi started playing: ${url} 🎶`);
    });
  }
}
