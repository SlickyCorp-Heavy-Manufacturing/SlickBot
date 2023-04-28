import { AudioResource, createAudioResource, demuxProbe } from '@discordjs/voice';
import { Message } from 'discord.js';
import ytdl = require('ytdl-core');
import { PlayItem } from './play-item';

export class PlayItemYoutube implements PlayItem {
  public readonly msg: Message;

  public readonly title: string;

  public readonly onStart: () => Promise<void>;

  public readonly onFinish: () => Promise<void>;

  public readonly onError: (error: Error) => Promise<void>;

  public readonly volume: number;

  private readonly url: string;

  private constructor(msg: Message, title: string, url: string, volume: number) {
    this.msg = msg;
    this.title = title;
    this.onError = async (error: Error) => {
      await msg.reply(`Slickyboi pooped: ${error} 🎶`);
      return Promise.resolve();
    };
    this.onFinish = async () => {};
    this.onStart = async () => {
      await msg.reply(`🎶 Slickyboi started playing: ${title} 🎶`);
      return Promise.resolve();
    };
    this.url = url;
    this.volume = volume;
  }

  public async createAudioResource(): Promise<AudioResource<PlayItem>> {
    return createAudioResource(
      ytdl(this.url, { filter: 'audioonly', dlChunkSize: 0 }),
      { metadata: this },
    );
  }

  public static async from(msg: Message, url: string, volume: number) {
    const info = await ytdl.getInfo(url);
    return new PlayItemYoutube(msg, info.videoDetails.title, url, volume);
  }
}
