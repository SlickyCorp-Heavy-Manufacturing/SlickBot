require('dotenv').config();
var schedule = require('node-schedule');

import Discord from 'discord.js';
import { Weather } from './weather/weather';
import { commandList } from './commandList';
import { ICommand } from './icommand';

const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;

bot.login(TOKEN);


function findChannelByName(name: String): Discord.TextChannel {
  const channel = bot.channels.find(channel => (channel as Discord.TextChannel).name === name);
  return (channel as Discord.TextChannel)
}

schedule.scheduleJob('30 8 * * *', function() {
  Weather.currentWeather().then((value: string) => {
    const channel = findChannelByName('noaa-information-bureau');
    channel.send(value);
  })
});

schedule.scheduleJob('0 12 * * *', function() {
  Weather.currentWeather().then((value: string) => {
    const channel = findChannelByName('noaa-information-bureau');
    channel.send(value);
  })
});

schedule.scheduleJob('30 4 * * *', function() {
  Weather.currentWeather().then((value: string) => {
    const channel = findChannelByName('noaa-information-bureau');
    channel.send(value);
  })
});

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', (msg: Discord.Message) => {
  const commands = commandList.filter((command: ICommand) => command.trigger(msg));
  commands.forEach((command) => {
    command.command(msg);
  });
});
