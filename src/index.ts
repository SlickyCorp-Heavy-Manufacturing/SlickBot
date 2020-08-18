require('dotenv').config();
var schedule = require('node-schedule');
const express = require('express')

import Discord from 'discord.js';
import { commandList } from './commandList';
import { scheduledPosts } from './scheduledPosts';
import { findChannelByName } from './utils';

const client = new Discord.Client();
const TOKEN = process.env.TOKEN;
const app = express()

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000 as any;
}
app.listen(port);

client.login(TOKEN);

client.on('ready', () => {
  console.info(`Logged in as ${client.user.tag}!`);
});

client.on('message', (msg: Discord.Message) => {
  const commands = commandList.filter((command) => command.trigger(msg));
  commands.forEach((command): void => command.command(msg));
});

scheduledPosts.forEach((scheduledPost) => {
  schedule.scheduleJob(scheduledPost.cronDate, () => {
    scheduledPost.getMessage().then((value: string) => {
      const channel = findChannelByName(client, scheduledPost.channel);
      channel.send(value);
    })
  });
});
