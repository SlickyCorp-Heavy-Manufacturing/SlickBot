import { URL } from 'url';
import { ChannelType, Message } from 'discord.js';
import yargs from 'yargs/yargs';
import ytpl from 'ytpl';

import { PlayQueue } from './play-queue.js';
import { PlayItem } from './play-item.js';
import { PlayItemYoutube } from './play-item-youtube.js';
import { PlayItemSoundcloud } from './play-item-soundcloud.js';
import { PlayItemTTS } from './play-item-tts.js';

export class Play {
  private static queue: PlayQueue;

  public static async playTrack(msg: Message, playNow: boolean): Promise<void> {
    if (msg.channel.type === ChannelType.DM) {
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
      const args = await yargs(msg.content)
        .number('volume').number('v')
        .options({
          url: { type: 'string', default: 'https://youtu.be/dQw4w9WgXcQ' },
          volume: { type: 'number', alias: 'v', default: '100' },
        }).parse();

      // If the url is provided as the last arg (without --url), use that
      if (args._.length > 1) {
        args.url = args._.pop() as string;
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
