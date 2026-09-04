import { AudioResource, createAudioResource, StreamType } from '@discordjs/voice';
import { Message } from 'discord.js';
import youtubeDl from 'youtube-dl-exec';
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

  private static readonly urlRegex = /(?:youtube(?:-nocookie)?\.com\/(?:shorts\/|[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]vi?=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

  private readonly videoId: string;

  private readonly url: string;

  private constructor(msg: Message, title: string, videoId: string, url: string, volume?: number) {
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
    this.url = url;
    this.volume = volume;
  }

  public createAudioResource(): Promise<AudioResource<PlayItem>> {
    console.log(`Creating audio resource for YouTube video ID: ${this.videoId}`);
    const streamProcess = youtubeDl.exec(this.url, {
      format: 'bestaudio[acodec=opus]/bestaudio',
      noPlaylist: true,
      output: '-'
    });
    if (!streamProcess.stdout) {
      throw new Error('Unable to create YouTube audio stream');
    }
    return Promise.resolve(createAudioResource(streamProcess.stdout, {
      inputType: StreamType.WebmOpus,
      metadata: this
    }));
  }

  public static async from(msg: Message, url: string, volume?: number) {
    this.innertube ??= await Innertube.create();

    // Get video ID from the URL
    console.log(`Extracting video ID from URL: ${url}`);
    const videoId = this.urlRegex.exec(url)?.[1];
    if (!videoId) {
      throw new Error('Unable to determine video ID from URL');
    }

    // Get basic info about the video
    const info = await this.innertube.getBasicInfo(videoId);
    console.log(`Retrieved video info: ${JSON.stringify(info.basic_info)}`);

    return new PlayItemYoutube(msg, info.basic_info.title ?? '<unknown title>', videoId, url, volume);
  }
}
