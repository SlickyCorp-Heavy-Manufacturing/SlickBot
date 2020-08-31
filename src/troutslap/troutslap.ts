import Discord, { DMChannel } from 'discord.js';
import { escapeMarkdown } from '../utils';
import { isSlickBotEmployee } from '../utils';
import { FOAAS } from '../foaas/foaas';

export class Troutslap {
  public static async slap(msg: Discord.Message): Promise<void> {
    if (msg.channel.type === 'text') {
      // If user is cool enough to troutslap
      if (isSlickBotEmployee(msg.author.username)) {
        // If @everyone or @here...
        if (msg.mentions.everyone) {
          // Assign a random trout
          // Reply in the publicly messaged channel.
          const slapMessage = `_slaps everyone with a ${Troutslap.randomTrout()}_`;
          await msg.channel.send(slapMessage)
            .catch(console.error);
        } else if (msg.mentions.users.size > 0) {
          // For each person,
          await Promise.all(msg.mentions.users.map((user) => {
            // Assign them a random trout
            // Reply in the publicly messaged channel.
            const slapMessage = `_slaps ${escapeMarkdown(user.username)} around with a ${Troutslap.randomTrout()}_`;
            return msg.channel.send(slapMessage)
              .catch(console.error);
          }));
        } else {
          Troutslap.dmUsage(msg);
        }
      // if user sucks, foff
      } else {
        const value = await FOAAS.foff(msg);
        msg.channel.send(value).catch(console.error);
      }
    } else {
      Troutslap.dmUsage(msg);
    }
  }

  private static dmUsage(msg: Discord.Message) {
    // Slide into author's DMs with usage.
    if (msg.author.dmChannel === null) {
      msg.author.createDM()
        .then((channel: DMChannel) => channel.send(this.usage()));
    } else {
      msg.author.dmChannel.send(this.usage());
    }
  }

  private static usage(): String {
    return `
Slap users around with a trout.

Usage:
!troutslap @user[ @user @user @user]
    Finds the named users' latest messages and slaps them in that channel for it.

!troutslap @everyone
!troutslap @here
    Slaps all users in the channel.`;
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
    ]

    private static randomTrout(): String {
      // TODO: Actually random. Unlike https://xkcd.com/221/
      return this.TROUT_LIST[Math.floor(Math.random() * this.TROUT_LIST.length)];
    }
}
