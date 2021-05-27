/* eslint no-bitwise: ["error", { "allow": ["<<"] }] */
import { protos, TextToSpeechClient } from '@google-cloud/text-to-speech';
import * as yargs from 'yargs';
import { Message, VoiceChannel } from 'discord.js';
import { Readable } from 'stream';

import Soundcloud from 'soundcloud.ts';
import ytdl from 'discord-ytdl-core';

interface PlayItem {
  msg: Message;
  text?: string;
  ttsRequest?: protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest;
  url?: string;
  voiceChannel: VoiceChannel;
  volume: number;
}

export class Play {
  private static currentlyPlaying = false;

  private static currentStream: any;

  private static queue: { (): void; }[] = [];

  private static generateUA(): string {
    const date = new Date();
    const version = `${((date.getFullYear() - 2018) * 4 + Math.floor(date.getMonth() / 4) + 58)}.0`;
    return `Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:${version} Gecko/20100101 Firefox/${version}`;
  }

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
    const items: PlayItem[] = [];
    if (msg.content.includes('http')) {
      const args = yargs
        .number('volume').number('v')
        .options({
          url: { type: 'string', default: 'https://youtu.be/dQw4w9WgXcQ' },
          volume: { type: 'number', alias: 'v', default: '100' },
        }).parse(msg.content);

      // If the url is provided as the last arg (without --url), use that
      if (yargs.argv._.length > 1) {
        args.url = yargs.argv._.pop().toString();
      }

      if (!(args.url.startsWith('https://')
        && (args.url.includes('youtube.com') || args.url.includes('youtu.be') || args.url.includes('soundcloud.com'))
      )) {
        await msg.reply(`${args.url} is not a dank enough beat, try again.`);
        return;
      }

      // Save this item to be played or added to queue
      items.push({
        msg,
        url: args.url,
        voiceChannel,
        volume: args.v,
      });
    } else {
      const text = msg.content.replace(/^![^\s]+\s+/, '');
      items.push(...text.match(/.{1,5000}(\s|$)/gs).map((part) => Object.create({
        msg,
        text: part,
        ttsRequest: {
          input: { text: part },
          voice: { name: 'en-US-Wavenet-C', languageCode: 'en-US' },
          audioConfig: { audioEncoding: 'MP3', volumeGainDb: 16 },
        },
        voiceChannel,
        volume: 150,
      })));
    }

    if (playNow) {
      this.startJamming(items.shift());
      if (items.length === 0) {
        return;
      }
    }

    // queue all remaining items
    this.queue.push(...items.map((item) => () => this.startJamming(item)));

    // process queue if we weren't told to play now
    if (!playNow) {
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
    const clientId = process.env.SOUNDCLOUD_ID;
    const soundcloud = new Soundcloud(clientId);

    try {
      if (item.ttsRequest) {
        const client = new TextToSpeechClient();
        const [response] = await client.synthesizeSpeech(item.ttsRequest);
        stream = Readable.from(response.audioContent);
      } else if (item.url.includes('soundcloud.com')) {
        stream = await soundcloud.util.streamTrack(item.url);
      } else {
        const headers: { [key: string]: string; } = {
          'Accept-Language': 'en-US,en;q=0.5',
          'User-Agent': Play.generateUA(),
        };
        if (process.env.YOUTUBE_COOKIE) {
          headers.cookie = process.env.YOUTUBE_COOKIE;
        }
        stream = ytdl(item.url, {
          filter: 'audioonly',
          highWaterMark: 1 << 25,
          opusEncoded: true,
          requestOptions: {
            headers,
          },
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
      connection.on('error', async (error) => {
        if (stream && stream.destroy) {
          console.log('Disconnected, destroying stream');
          stream.destroy(error);
        }
        await item.msg.reply(`Slickyboi pooped: ${error} 🎶`);
      });

      let options = {};
      if (item.url && !item.url.includes('soundcloud.com')) {
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

      if (item.text) {
        await item.msg.reply(`🎙️ Slickyboi started speaking:\n> ${item.text.replace(/\n{1,}/gm, '\n> ')}`);
      } else {
        await item.msg.reply(`🎶 Slickyboi started playing: ${item.url} 🎶`);
      }
    });
  }
}
