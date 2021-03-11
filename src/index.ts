import Discord from 'discord.js';
import { readFileSync } from 'fs';

import { commandList } from './commandList';
import { scheduledPosts } from './scheduledPosts';
import { findChannelByName } from './utils';
import { DiscordClient } from './discordClient';

require('dotenv').config();
const schedule = require('node-schedule');

process.on('unhandledRejection', (reason, p) => {
  console.log(`caught your junk ${reason} ${p}`);
});

// Write out the Google Cloud Credentials if provided
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.log('Google Credentials')
  console.log('  process.env.GOOGLE_APPLICATION_CREDENTIALS=%s', process.env.GOOGLE_APPLICATION_CREDENTIALS);
  try {
    console.log('  %s=%s',
      process.env.GOOGLE_APPLICATION_CREDENTIALS,
      readFileSync(process.env.GOOGLE_API_CREDS_CONTENT, { encoding: 'utf8' }),
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
    schedule.scheduleJob({ rule: scheduledPost.cronDate, tz: 'America/Chicago' }, () => {
      scheduledPost.getMessage(discordClient.client).then((value) => {
        if (value) {
          const channel = findChannelByName(discordClient.client, scheduledPost.channel);
          if (Array.isArray(value)) {
            value.forEach((message) => channel.send(message));
          } else {
            channel.send(value);
          }
        }
      });
    });
  });
});
