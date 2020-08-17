require('dotenv').config();
import Discord from 'discord.js';

var schedule = require('node-schedule');

import { Weather } from './commands/weather'
import { commandList } from './commands/commandList';
import { ICommand } from './commands/icommand';

const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;

bot.login(TOKEN);

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', msg => {
  const command = commandList.filter((command: ICommand) => command.trigger(msg));
  if (command) {
    command.command().then(result => msg.channel.send(result));
  }
});

schedule.scheduleJob('* * 8 * *', function() {
  Weather.currentWeather().then( value => {
    const channel = bot.channels.find(channel => (channel as Discord.TextChannel).name === 'noaa-information-bureau');
    (channel as Discord.TextChannel).send(value);
  })
});
