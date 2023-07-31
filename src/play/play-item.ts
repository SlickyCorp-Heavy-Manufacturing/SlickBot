import { Readable } from 'stream';
import {
  AudioPlayerError, AudioResource, createAudioResource, demuxProbe, StreamType,
} from '@discordjs/voice';
import { protos, TextToSpeechClient } from '@google-cloud/text-to-speech';
import { Message } from 'discord.js';
import Soundcloud from 'soundcloud.ts';
import { exec as ytdl } from 'youtube-dl-exec';
import { getInfo } from 'ytdl-core';

export interface PlayItem {
  createAudioResource: () => Promise<AudioResource<PlayItem>>
  msg: Message;
  title: string;
  onStart: () => Promise<void>;
  onFinish: () => Promise<void>;
  onError: (error: Error) => Promise<void>;
  volume: number;
}
