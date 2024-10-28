import { AudioResource, createAudioResource } from '@discordjs/voice';
import * as cookie from 'cookie';
import { Message } from 'discord.js';
import ytdl = require('@distube/ytdl-core');
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
      console.error(error);
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
    let agent: ytdl.Agent;
    if (process.env.YOUTUBE_COOKIE) {
      const parsedCookies = cookie.parse(process.env.YOUTUBE_COOKIE);
      const cookies: ytdl.Cookie[] = [];
      for (const key in parsedCookies) {
        if (Object.prototype.hasOwnProperty.call(parsedCookies, key)) {
          console.log(`Adding YouTube Cookie: ${key}`);
          cookies.push({ name: key, value: parsedCookies[key] });
        }
      }
      agent = ytdl.createAgent(cookies);
    }

    return createAudioResource(
      ytdl(this.url, { agent, filter: 'audioonly', dlChunkSize: 0 }),
      { metadata: this },
    );
  }

  public static async from(msg: Message, url: string, volume: number) {
    const info = await ytdl.getInfo(url);
    return new PlayItemYoutube(msg, info.videoDetails.title, url, volume);
  }
}
