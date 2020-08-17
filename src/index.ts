require('dotenv').config();
import Discord from 'discord.js';

var schedule = require('node-schedule');

import { Weather } from './weather/weather'
import { Troutslap } from './troutslap/troutslap';

const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;

bot.login(TOKEN);

function findChannelByName(name: String): Discord.TextChannel {
  const channel = bot.channels.find(channel => (channel as Discord.TextChannel).name === name);
  return (channel as Discord.TextChannel)
}

schedule.scheduleJob('30 8 * * *', function() {
  Weather.currentWeather().then( value => {
    const channel = findChannelByName('noaa-information-bureau');
    channel.send(value);
  })
});

schedule.scheduleJob('0 12 * * *', function() {
  Weather.currentWeather().then( value => {
    const channel = findChannelByName('noaa-information-bureau');
    channel.send(value);
  })
});

schedule.scheduleJob('30 4 * * *', function() {
  Weather.currentWeather().then( value => {
    const channel = findChannelByName('noaa-information-bureau');
    channel.send(value);
  })
});

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', msg => {
  // Mike's stupid bot replies
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

  // Darrell's stupid bot replies
  if(msg.author.username === 'Pulak' && (msg.channel as Discord.TextChannel).name === 'thing-i-would-buy') {
    msg.reply('https://i.redd.it/ng2ewzvfado21.jpg')
  }

  if (msg.content.startsWith('!troutslap')) {
    Troutslap.slap(msg);
  }
});
