import Discord, { TextChannel } from 'discord.js';

import { commandList } from './commandList';
import { scheduledPosts } from './scheduledPosts';
import { findChannelByName } from './utils';
import { DiscordClient } from './discordClient';

const express = require('express');
require('dotenv').config();
const schedule = require('node-schedule');

// I dont know if this is needed anymore, it was used for herkoku web
// but now its using a worker

const app = express();
let port = process.env.PORT;
if (port === null || port === '') {
  port = 8000 as any;
}

app.listen(port, () => {
  console.info('App Listening');
});

process.on('unhandledRejection', (reason, p) => {
  console.log(`caught your junk ${reason} ${p}`);
});

const discordClient = new DiscordClient();
discordClient.init().then(() => {
  discordClient.client.on('ready', () => {
    // Integration test channel
    discordClient.client.channels.fetch('745350887316258976').then((channel) => {
      if (channel instanceof TextChannel) {
        channel.send('A new build of SlickBot has just started running');
      }
    }).catch((reason) => console.log(reason));

    // Judgement Day Channel
    discordClient.client.channels.fetch('744689796554817556').then((channel) => {
      if (channel instanceof TextChannel) {
        channel.send('A new build of SlickBot has just started running');
      }
    }).catch((reason) => console.log(reason));
  });

  discordClient.client.on('message', (msg: Discord.Message) => {
    const commands = commandList.filter((command) => command.trigger(msg));
    Promise.all(commands.map(async (command) => {
      command.command(msg);
    })).then();
  });

  scheduledPosts.forEach((scheduledPost) => {
    schedule.scheduleJob({ rule: scheduledPost.cronDate, tz: 'America/Chicago' }, () => {
      scheduledPost.getMessage(discordClient.client).then((value: string) => {
        const channel = findChannelByName(discordClient.client, scheduledPost.channel);
        channel.send(value);
      });
    });
  });
});
