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

  private static agent: ytdl.Agent;

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

  public static get Agent() {
    if (process.env.YOUTUBE_COOKIE && this.agent === undefined) {
      const parsedCookies = cookie.parse(process.env.YOUTUBE_COOKIE);
      const cookies: ytdl.Cookie[] = [];
      for (const key in parsedCookies) {
        if (Object.prototype.hasOwnProperty.call(parsedCookies, key)) {
          console.log(`Adding YouTube Cookie: ${key}`);
          cookies.push({
            domain: '.youtube.com',
            expirationDate: Date.now() + (365 * 24 * 60 * 60 * 1000),
            hostOnly: false,
            httpOnly: true,
            name: key,
            path: '/',
            sameSite: 'no_restriction',
            secure: true,
            value: parsedCookies[key],
          });
        }
      }
      this.agent = ytdl.createAgent(cookies, {});
    }

    return this.agent;
  }

  public async createAudioResource(): Promise<AudioResource<PlayItem>> {
    return createAudioResource(
      ytdl(this.url, { agent: PlayItemYoutube.Agent, filter: 'audioonly', dlChunkSize: 0 }),
      { metadata: this },
    );
  }

  public static async from(msg: Message, url: string, volume: number) {
    const info = await ytdl.getInfo(url, { agent: PlayItemYoutube.Agent });
    return new PlayItemYoutube(msg, info.videoDetails.title, url, volume);
  }
}
