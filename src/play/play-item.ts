import { AudioResource } from '@discordjs/voice';
import { Message } from 'discord.js';

export interface PlayItem {
  createAudioResource: () => Promise<AudioResource<PlayItem>>
  msg: Message;
  title: string;
  onStart: () => Promise<void>;
  onFinish: () => Promise<void>;
  onError: (error: Error) => Promise<void>;
  volume?: number;
}
