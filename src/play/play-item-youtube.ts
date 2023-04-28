import { AudioResource, createAudioResource, demuxProbe } from '@discordjs/voice';
import { Message } from 'discord.js';
import { exec as ytdl } from 'youtube-dl-exec';
import { getInfo } from 'ytdl-core';
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

  public createAudioResource(): Promise<AudioResource<PlayItem>> {
    return new Promise((resolve, reject) => {
      const process = ytdl(
        this.url,
        {
          format: 'bestaudio',
          limitRate: '800K',
          output: '-',
          quiet: true,
        },
        {
          stdio: ['ignore', 'pipe', 'ignore'],
        },
      );
      if (!process.stdout) {
        reject(new Error('No stdout'));
        return;
      }
      const stream = process.stdout;
      const onError = (err: any) => {
        if (!process.killed) {
          process.kill();
        }
        stream.resume();
        reject(err);
      };
      process
        .once('spawn', () => {
          demuxProbe(stream)
            .then((probe: { stream: any; type: any; }) => resolve(
              createAudioResource(probe.stream, { metadata: this, inputType: probe.type }),
            ))
            .catch(onError);
        })
        .catch(onError);
    });
  }

  public static async from(msg: Message, url: string, volume: number) {
    const info = await getInfo(url);
    return new PlayItemYoutube(msg, info.videoDetails.title, url, volume);
  }
}
