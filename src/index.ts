const express = require('express')
require('dotenv').config();
var schedule = require('node-schedule');

import Discord from 'discord.js';

import { commandList } from './commandList';
import { scheduledPosts } from './scheduledPosts';
import { findChannelByName } from './utils';
import { DiscordClient } from './discordClient';

// I dont know if this is needed anymore, it was used for herkoku web
// but now its using a worker

const app = express()
let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000 as any;
}

app.listen(port, () => {
  console.info('App Listening');
});

const discordClient = new DiscordClient();
discordClient.init().then( value => {
  console.log('client init')
});

discordClient.client.on('message', (msg: Discord.Message) => {
  const commands = commandList.filter((command) => command.trigger(msg));
  commands.forEach((command): void => command.command(msg));
});

scheduledPosts.forEach((scheduledPost) => {
  schedule.scheduleJob(scheduledPost.cronDate, () => {
    scheduledPost.getMessage().then((value: string) => {
      const channel = findChannelByName(discordClient.client, scheduledPost.channel);
      channel.send(value);
    })
  });
});
