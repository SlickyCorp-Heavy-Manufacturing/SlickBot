import { Events, Message } from 'discord.js';
import 'dotenv/config';
import { scheduleJob } from 'node-schedule';

import { commandList } from './commandList.js';
import { scheduledPosts } from './scheduledPosts.js';
import { findChannelById, unpinBotMessages } from './utils.js';
import { DiscordClient } from './discordClient.js';

process.on('unhandledRejection', (reason: Error | any) => {
  console.log('caught your junk %s', reason);
  if (reason.stack) {
    console.log(reason.stack);
  }
});

const discordClient = new DiscordClient();
discordClient.init().then(() => {
  discordClient.client.on(Events.MessageCreate, (msg: Message) => {
    const commands = commandList.filter((command) => command.trigger(msg));
    Promise.all(commands.map(async (command) => {
      command.command(msg);
    })).then();
  });

  scheduledPosts.forEach((scheduledPost) => {
    scheduleJob({ rule: scheduledPost.cronDate, tz: 'America/Chicago' }, async () => {
      const message = await scheduledPost.getMessage(discordClient.client);
      if (
        (Array.isArray(message) && message.length > 0)
        || (!Array.isArray(message) && message.trim() !== '')
      ) {
        const channel = await findChannelById(discordClient.client, scheduledPost.channel);

        if (scheduledPost.pinMessage === true) {
          // Unpin other messages from this user
          await unpinBotMessages(discordClient.client, channel);
        }

        if (Array.isArray(message)) {
          message.forEach(async (msg) => {
            const sent = await channel.send(msg);
            if (scheduledPost.pinMessage === true) {
              await sent.pin();
            }
          });
        } else {
          const sent = await channel.send(message);
          if (scheduledPost.pinMessage === true) {
            await sent.pin();
          }
        }
      }
    });
  });
});
