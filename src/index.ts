import { Cron } from 'croner';
import { Events, Message, MessageCreateOptions, MessagePayload } from 'discord.js';
import 'dotenv/config';

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
    new Cron(scheduledPost.cronDate, { timezone: 'America/Chicago' }, async () => {
      const message = await scheduledPost.getMessage(discordClient.client);
      if (
        (Array.isArray(message) && message.length > 0)
        || (!Array.isArray(message) && ((typeof message === 'string' || message instanceof String) &&  message.trim() !== ''))
      ) {
        const channel = await findChannelById(discordClient.client, scheduledPost.channel);

        if (scheduledPost.pinMessage === true) {
          // Unpin other messages from this user
          await unpinBotMessages(discordClient.client, channel);
        }

        if (Array.isArray(message)) {
          message.forEach(async (msg: string | MessagePayload | MessageCreateOptions) => {
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
