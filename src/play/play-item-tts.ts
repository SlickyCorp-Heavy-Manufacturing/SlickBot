import { Readable } from 'stream';
import { AudioResource, createAudioResource, StreamType } from '@discordjs/voice';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { Message } from 'discord.js';

import { PlayItem } from './play-item.js';

export class PlayItemTTS implements PlayItem {
  public readonly msg: Message;

  public readonly title: string;

  public readonly onStart: () => Promise<void>;

  public readonly onFinish: () => Promise<void>;

  public readonly onError: (error: Error) => Promise<void>;

  public readonly volume?: number;

  private readonly text: string;

  public constructor(msg: Message, text: string, title: string, volume?: number) {
    this.msg = msg;
    this.text = text;
    this.title = title;
    this.onError = async (error: Error) => {
      await msg.reply(`Slickyboi pooped: ${error} 🎙️`);
      return Promise.resolve();
    };
    this.onFinish = async () => { /* do nothing */ };
    this.onStart = async () => {
      await msg.reply(`🎙️ Slickyboi started speaking:\n> ${text.replace(/\n{1,}/gm, '\n> ')}`);
      return Promise.resolve();
    };
    this.volume = volume;
  }

  public async createAudioResource(): Promise<AudioResource<PlayItem>> {
    const client = new TextToSpeechClient();
    const [response] = await client.synthesizeSpeech({
      input: { text: this.text },
      voice: { name: 'en-US-Wavenet-C', languageCode: 'en-US' },
      audioConfig: { audioEncoding: 'OGG_OPUS', volumeGainDb: 16 },
    });
    if (response.audioContent) {
      return createAudioResource(
        Readable.from(response.audioContent),
        { metadata: this, inputType: StreamType.OggOpus },
      );
    } else {
      throw new Error('Received undefined audioContent');
    }
  }
}
