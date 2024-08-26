import { AudioResource, createAudioResource, StreamType } from '@discordjs/voice';
import { Message } from 'discord.js';
import Soundcloud from 'soundcloud.ts';

import { PlayItem } from './play-item';

export class PlayItemSoundcloud implements PlayItem {
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
      await msg.reply(`🎶 Slickyboi started playing: ${title}`);
      return Promise.resolve();
    };
    this.url = url;
    this.volume = volume;
  }

  public async createAudioResource(): Promise<AudioResource<PlayItem>> {
    return createAudioResource(this.url, { metadata: this });
  }

  public static async from(msg: Message, url: string, volume: number): Promise<PlayItemSoundcloud> {
    const soundcloud = new Soundcloud(process.env.SOUNDCLOUD_ID);
    const track = await soundcloud.tracks.get(url);
    const streamUrl = await soundcloud.util.streamLink(url);
    if (!streamUrl) {
      throw new Error('This SoundCloud song is unable to be played');
    }

    return new PlayItemSoundcloud(msg, track.title, url, volume);
  }
}
