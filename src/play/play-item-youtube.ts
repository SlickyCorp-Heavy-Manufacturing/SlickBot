import { AudioResource, createAudioResource } from '@discordjs/voice';
import { Message } from 'discord.js';
import { Readable } from 'node:stream';
import type { ReadableStream } from 'node:stream/web'
import { Innertube } from 'youtubei.js';

import { PlayItem } from './play-item.js';

export class PlayItemYoutube implements PlayItem {
  public readonly msg: Message;

  public readonly title: string;

  public readonly onStart: () => Promise<void>;

  public readonly onFinish: () => Promise<void>;

  public readonly onError: (error: Error) => Promise<void>;

  public readonly volume?: number;

  private static innertube: Innertube;

  private static readonly urlRegex = /(?:youtube(?:-nocookie)?\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]vi?=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

  private readonly videoId: string;

  private constructor(msg: Message, title: string, videoId: string, volume?: number) {
    this.msg = msg;
    this.title = title;
    this.onError = async (error: Error) => {
      await msg.reply(`Slickyboi pooped: ${error} 🎶`);
      console.error(error);
      return Promise.resolve();
    };
    this.onFinish = async () => { /* do nothing */ };
    this.onStart = async () => {
      await msg.reply(`🎶 Slickyboi started playing: ${title} 🎶`);
      return Promise.resolve();
    };
    this.videoId = videoId;
    this.volume = volume;
  }

  public async createAudioResource(): Promise<AudioResource<PlayItem>> {
    return Promise.resolve(createAudioResource(
      Readable.fromWeb(
        await PlayItemYoutube.innertube.download(
          this.videoId,
          { codec: 'opus', format: 'any', type: 'audio' },
        ) as ReadableStream<Uint8Array>
      ),
      { metadata: this },
    ));
  }

  public static async from(msg: Message, url: string, volume?: number) {
    this.innertube ??= await Innertube.create();

    // Get video ID from the URL
    const videoId = this.urlRegex.exec(url)?.[1];
    if (!videoId) {
      throw new Error('Unable to determine video ID from URL');
    }

    // Get basic info about the video
    const info = await this.innertube.getBasicInfo(videoId);

    return new PlayItemYoutube(msg, info.basic_info.title ?? '<unknown title>', videoId, volume);
  }
}
