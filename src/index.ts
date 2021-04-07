import Discord from 'discord.js';
import { readFileSync } from 'fs';
import { scheduleJob } from 'node-schedule';

import { commandList } from './commandList';
import { scheduledPosts } from './scheduledPosts';
import { findChannelById } from './utils';
import { DiscordClient } from './discordClient';

require('dotenv').config();

process.on('unhandledRejection', (reason, p) => {
  console.log(`caught your junk ${reason} ${p}`);
});

// Write out the Google Cloud Credentials if provided
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.log('Google Credentials');
  console.log('  process.env.GOOGLE_APPLICATION_CREDENTIALS=%s', process.env.GOOGLE_APPLICATION_CREDENTIALS);
  try {
    console.log(
      '  %s=%s',
      process.env.GOOGLE_APPLICATION_CREDENTIALS,
      readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, { encoding: 'utf8' }),
    );
  } catch (err) {
    console.log('  ERROR: Failed to read file: %o', err);
  }
} else {
  console.log('WARNING: GOOGLE_APPLICATION_CREDENTIALS env variable not set, TTS will not work');
  console.log('  process.env.GOOGLE_APPLICATION_CREDENTIALS=%s', process.env.GOOGLE_APPLICATION_CREDENTIALS);
}

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
      const message = scheduledPost.getMessage(discordClient.client);
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
