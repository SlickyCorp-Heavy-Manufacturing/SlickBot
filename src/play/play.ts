/* eslint no-bitwise: ["error", { "allow": ["<<"] }] */
import * as googleTTS from 'google-tts-api';
import * as yargs from 'yargs';
import { Message, VoiceChannel } from 'discord.js';

import Soundcloud from 'soundcloud.ts';
import ytdl from 'discord-ytdl-core';

interface PlayItem {
  msg: Message;
  text?: string;
  url: string;
  voiceChannel: VoiceChannel;
  volume: number;
}

export class Play {
  private static currentlyPlaying = false;

  private static currentStream: any;

  private static queue: { (): void; }[] = [];

  public static async playTrack(msg: Message, playNow: boolean): Promise<void> {
    if (msg.channel.type === 'dm') {
      await msg.reply('Don\'t !play with your DMs.');
      return;
    }

    const DRUNK_ROLE = msg.guild.roles.cache.find((role) => role.name === 'drunk');
    if (DRUNK_ROLE && msg.member.roles.cache.has(DRUNK_ROLE.id)) {
      await msg.reply('You\'re drunk, go home.');
      return;
    }

    const voiceChannel = msg.member.voice.channel;
    if (!voiceChannel) {
      await msg.reply('Join a voice channel, Dumas!');
      return;
    }

    // Does this contain a URL?
    let item: PlayItem;
    if (msg.content.includes('http')) {
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

      // Save this item to be played or added to queue
      item = {
        msg,
        url: args.url,
        voiceChannel,
        volume: args.v,
      };
    } else {
      const text = msg.content.replace(/^![^\s]+\s+/, '');
      item = {
        msg,
        text,
        url: googleTTS.getAudioUrl(text),
        voiceChannel,
        volume: 100,
      };
    }

    if (playNow) {
      this.startJamming(item);
    } else {
      const queuedTrackCallback = () => this.startJamming(item);
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
  private static async startJamming(item: PlayItem): Promise<void> {
    this.currentlyPlaying = true;
    let stream: any;
    const clientId = 'ymSs5c4hxrRu3yuA6ZyOORoADJI2tVPD';
    const soundcloud = new Soundcloud(clientId);

    try {
      if (item.url.includes('soundcloud.com')) {
        stream = await soundcloud.util.streamTrack(item.url);
      } else if (item.url.includes('translate.google.com')) {
        stream = item.url;
      } else {
        stream = ytdl(item.url, {
          filter: 'audioonly',
          highWaterMark: 1 << 25,
          opusEncoded: true,
        });
      }
    } catch (error) {
      await item.msg.reply(`Slickyboi pooped: ${error} 🎶`);
      return;
    }

    item.voiceChannel.join().then(async (connection) => {
      // Kill the current stream, if it exists
      if (Play.currentStream) {
        console.log('Destroying current stream');
        if (Play.currentStream.destroy) {
          Play.currentStream.destroy();
        }
        Play.currentStream = undefined;
      }
      Play.currentStream = stream;

      // Kill the stream if the bot is disconnected before the end of the stream
      connection.on('disconnect', (err) => {
        if (stream && stream.destroy) {
          console.log('Disconnected, destroying stream');
          stream.destroy(err);
        }
      });

      let options = {};
      if (!item.url.includes('soundcloud.com') && !item.url.includes('translate.google.com')) {
        options = { type: 'opus' };
      }

      const dispatcher = connection.play(stream, options);
      dispatcher.setVolumeLogarithmic(item.volume / 100);
      dispatcher.on('error', console.error);
      dispatcher.on('finish', () => {
        item.voiceChannel.leave();
        this.currentlyPlaying = false;
        setTimeout(() => this.processQueue(), 100);
      });

      if (item.url.includes('translate.google.com')) {
        await item.msg.reply(`🎙️ Slickyboi started speaking: ${item.text} 🎙️`);
      } else {
        await item.msg.reply(`🎶 Slickyboi started playing: ${item.url} 🎶`);
      }
    });
  }
}
