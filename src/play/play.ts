import { Message } from 'discord.js';
import { URL } from 'url';
import * as yargs from 'yargs';
import ytpl from 'ytpl';

import { PlayQueue } from './play-queue';
import { PlayItem } from './play-item';
import { PlayItemYoutube } from './play-item-youtube';
import { PlayItemSoundcloud } from './play-item-soundcloud';
import { PlayItemTTS } from './play-item-tts';

export class Play {
  private static queue: PlayQueue;

  public static async playTrack(msg: Message, playNow: boolean): Promise<void> {
    if (msg.channel.type === 'DM') {
      await msg.reply('Don\'t !play with your DMs.');
      return;
    }

    const DRUNK_ROLE = msg.guild.roles.cache.find((role) => role.name === 'drunk');
    if (DRUNK_ROLE && msg.member.roles.cache.has(DRUNK_ROLE.id)) {
      await msg.reply('You\'re drunk, go home.');
      return;
    }

    const voiceChannel = msg.member.voice.channel;
    if (!voiceChannel) {
      await msg.reply('Join a voice channel, Dumas!');
      return;
    }

    // Does this contain a URL?
    const items: PlayItem[] = [];
    if (msg.content.includes('http')) {
      const args = yargs
        .number('volume').number('v')
        .options({
          url: { type: 'string', default: 'https://youtu.be/dQw4w9WgXcQ' },
          volume: { type: 'number', alias: 'v', default: '100' },
        }).parseSync(msg.content);

      // If the url is provided as the last arg (without --url), use that
      const additionalArgs: string[] = (yargs.argv as any)._ as string[];
      if (additionalArgs.length > 1) {
        args.url = additionalArgs.pop();
      }

      if (args.url.startsWith('https://')) {
        const url = new URL(args.url);
        if (['youtu.be', 'youtube.com', 'www.youtube.com'].includes(url.hostname)) {
          // Check if this is a youtube playlist or not
          if (url.pathname === '/playlist' && url.searchParams.has('list')) {
            const playlist = await ytpl(url.searchParams.get('list'));
            for (const playlistItem of playlist.items) {
              items.push(await PlayItemYoutube.from(msg, playlistItem.url, args.v));
            }
          } else {
            items.push(await PlayItemYoutube.from(msg, args.url, args.v));
          }
        } else if (url.hostname === 'soundcloud.com') {
          try {
            items.push(await PlayItemSoundcloud.from(msg, args.url, args.v));
          } catch (err) {
            await msg.reply(err.message);
          }
        } else {
          await msg.reply(`${args.url} is not a dank enough beat, try again.`);
          return;
        }
      }
    } else {
      const text = msg.content.replace(/^![^\s]+\s+/, '');
      items.push(...text.match(/.{1,5000}(\s|$)/gs).map((part) => new PlayItemTTS(msg, part, 'Some Text', 150)));
    }

    // Setup Queue if we haven't already
    if (!this.queue) {
      this.queue = new PlayQueue();
    }

    if (playNow) {
      this.queue.stop();
    }

    // queue all remaining items
    for (const item of items) {
      this.queue.enqueue(item);
    }
  }
}
