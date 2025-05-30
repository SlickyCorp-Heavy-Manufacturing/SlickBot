import { ChannelType, DMChannel, Message, TextChannel } from 'discord.js';
import { sample } from 'lodash-es';

import { escapeMarkdown } from '../utils.js';

export class Troutslap {
  public static async slap(msg: Message): Promise<void> {
    if (msg.channel.type === ChannelType.GuildText) {
      // If @everyone or @here...
      if (msg.mentions.users.size > 0) {
        // For each person,
        await Promise.all(
          msg.mentions.users.map(
            (user) => Troutslap.sendMessage(msg, user.username),
          ),
        );
      } else {
        await Promise.all(msg.cleanContent.split(', ').map((item: string) => {
          // Handle case where first split contains command
          return Troutslap.sendMessage(msg, item.replace(/^!troutslap\s+/, ''));
        }));
      }
    } else {
      await Troutslap.dmUsage(msg);
    }
  }

  private static sendMessage(msg: Message, item: string) {
    // Assign a random trout
    // Reply in the publicly messaged channel.
    const slapMessage = `_slaps ${escapeMarkdown(item)} around with a ${Troutslap.randomTrout()}_`;
    return (msg.channel as TextChannel).send(slapMessage)
      .catch(console.error);
  }

  private static async dmUsage(msg: Message) {
    // Slide into author's DMs with usage.
    if (msg.author.dmChannel === null) {
      await msg.author.createDM().then((channel: DMChannel) => channel.send(this.usage()));
    } else {
      await msg.author.dmChannel.send(this.usage());
    }
  }

  private static usage(): string {
    return `
Slap users around with a trout.

Usage:
  !troutslap @user[ @user @user @user]
  !troutslap @everyone
  !troutslap @here
  !troutslap thing[, thing, thing]
    (please do not mix @usernames and non-usernames)`;
  }

  private static TROUT_LIST = [
    // sized trout
    'giant trout',
    'large trout',
    'small trout',
    'tiny trout',
    'diminutive trout',
    'infitesimally small trout',

    // other adjective trout
    'wet trout',
    'smelly trout',
    'slimy trout',

    // actual trout species
    'Adriatic trout',
    'brown trout',
    'river trout',
    'flathead trout',
    'marble trout',
    'ohrid trout',
    'sevan trout',
    'biwa trout',
    'cutthroat trout',
    'gila trout',
    'Apache trout',
    'rainbow trout',
    'Mexican golden trout',
    'brook trout',
    'bull trout',
    'Dolly Varden trout',
    'lake trout',
    'silver trout',
    'tiger trout',
    'Splake trout',

    // lulz
    'MR402-sized trout',
  ];

  private static randomTrout(): string | undefined {
    return sample(this.TROUT_LIST);
  }
}
