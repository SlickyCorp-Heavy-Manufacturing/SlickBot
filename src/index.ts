require('dotenv').config();
import Discord from 'discord.js';

var schedule = require('node-schedule');

import { Weather } from './weather'

const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;

bot.login(TOKEN);

schedule.scheduleJob('30 8 * * *', function() {
  Weather.currentWeather().then( value => {
    const channel = bot.channels.find(channel => (channel as Discord.TextChannel).name === 'noaa-information-bureau');
    (channel as Discord.TextChannel).send(value);
  })
});

schedule.scheduleJob('0 12 * * *', function() {
  Weather.currentWeather().then( value => {
    const channel = bot.channels.find(channel => (channel as Discord.TextChannel).name === 'noaa-information-bureau');
    (channel as Discord.TextChannel).send(value);
  })
});

schedule.scheduleJob('30 4 * * *', function() {
  Weather.currentWeather().then( value => {
    const channel = bot.channels.find(channel => (channel as Discord.TextChannel).name === 'noaa-information-bureau');
    (channel as Discord.TextChannel).send(value);
  })
});

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', msg => {
  switch(msg.content) {
    case 'ping':
      msg.reply('pong');
      break;
    case '!weather':
        Weather.currentWeather().then( value => {
          msg.channel.send(value);
        })
      break;
    case '!help':
      msg.reply('no');
      break;
    case '!commands':
      msg.reply('!help for commands');
      break;
  }
});
