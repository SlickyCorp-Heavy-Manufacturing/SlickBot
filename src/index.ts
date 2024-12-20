import { Cron } from 'croner';
import { Events, Message } from 'discord.js';
import 'dotenv/config';

import { commandList } from './commandList.js';
import { scheduledPosts } from './scheduledPosts.js';
import { findChannelById, unpinBotMessages } from './utils.js';
import { DiscordClient } from './discordClient.js';

process.on('unhandledRejection', (reason: unknown) => {
  console.log('caught your junk \n%s', reason);
  if (reason instanceof Error && reason.stack) {
    console.log(reason.stack);
  }
});

const discordClient = new DiscordClient();
await discordClient.init().then((client) => {
  client.on(Events.MessageCreate, (msg: Message) => {
    const commands = commandList.filter((command) => command.trigger(msg));
    void Promise.all(commands.map(async (command) => {
      await command.command(msg);
    }));
  });

  scheduledPosts.forEach((scheduledPost) => {
    new Cron(scheduledPost.cronDate, { timezone: 'America/Chicago' }, async () => {
      const message = await scheduledPost.getMessage(client);
      if (
        (Array.isArray(message) && message.length > 0)
        || (!Array.isArray(message) && ((typeof message === 'string' || message instanceof String) &&  message.trim() !== ''))
      ) {
        const channel = await findChannelById(client, scheduledPost.channel);

        if (scheduledPost.pinMessage === true) {
          // Unpin other messages from this user
          await unpinBotMessages(client, channel);
        }

        if (Array.isArray(message)) {
          for (const msg of message) {
            const sent = await channel.send(msg);
            if (scheduledPost.pinMessage === true) {
              await sent.pin();
            }
          }
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

process.on('exit', () => {
  if (discordClient) {
    void discordClient.client?.destroy();
  }
});
