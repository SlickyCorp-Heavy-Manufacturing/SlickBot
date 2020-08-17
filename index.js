require('dotenv').config();
const Discord = require('discord.js');
const got = require('got');
var schedule = require('node-schedule');

const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;

bot.login(TOKEN);

function currentWeather(channel) {
  got('https://api.weather.gov/zones/land/WIZ066/forecast', {responseType: 'json'}).then( response => {
    const forcast = response.body.properties.periods[0];
    channel.send(`${forcast.name} ${forcast.detailedForecast}`);
   })
}

schedule.scheduleJob('* * 8 * *', function(){
  got('https://api.weather.gov/zones/land/WIZ066/forecast', {responseType: 'json'}).then( response => {
    // console.log(response);
     const channel = bot.channels.find(channel => channel.name === 'noaa-information-bureau')
     currentWeather(channel);
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
      currentWeather(msg.channel);
      break;
    case '!help':
      msg.reply('no');
      break;
    case '!commands':
      msg.reply('!help for commands');
      break;
  }
});
