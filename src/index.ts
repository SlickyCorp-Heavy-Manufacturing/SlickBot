import Discord from 'discord.js';
import { readFileSync } from 'fs';
import { scheduleJob } from 'node-schedule';

import { commandList } from './commandList';
import { scheduledPosts } from './scheduledPosts';
import { findChannelById } from './utils';
import { DiscordClient } from './discordClient';

require('dotenv').config();

process.on('unhandledRejection', (reason: Error | any, p: Promise<any>) => {
  console.log('caught your junk %s', reason);
  if (reason.stack) {
    console.log(reason.stack);
  }
});

const discordClient = new DiscordClient();
discordClient.init().then(() => {
  discordClient.client.on('message', (msg: Discord.Message) => {
    const commands = commandList.filter((command) => command.trigger(msg));
    Promise.all(commands.map(async (command) => {
      command.command(msg);
    })).then();
  });

  scheduledPosts.forEach((scheduledPost) => {
    scheduleJob({ rule: scheduledPost.cronDate, tz: 'America/Chicago' }, async () => {
      const message = await scheduledPost.getMessage(discordClient.client);
      if (message) {
        const channel = await findChannelById(discordClient.client, scheduledPost.channel);
        if (Array.isArray(message)) {
          message.forEach((msg) => channel.send(msg));
        } else {
          channel.send(message);
        }
      }
    });
  });
});
