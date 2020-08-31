import { Client, TextChannel } from 'discord.js';

export function findChannelByName(client: Client, name: String): TextChannel {
  return client.channels.find((channel) => (channel as TextChannel).name === name) as TextChannel;
}

export function escapeMarkdown(text: String): String {
  const unescaped = text.replace(/\\(\*|_|`|~|\\)/g, '$1'); // unescape any "backslashed" character
  const escaped = unescaped.replace(/(\*|_|`|~|\\)/g, '\\$1'); // escape *, _, `, ~, \
  return escaped;
}

export function isSlickBotEmployee(user: string): Boolean {
  var SLICK_BOT_EMPLOYEES = ['TestSlickBot', 'TestUserBot', 'SlickBot', 'darrellDAbarrel', '[EliteTerrorist]AbeLincoln', '7u7k0w5k1', 'biternosintaph', 's_kow', 'freedeau', 'krische', 'Pulak']  
  if(SLICK_BOT_EMPLOYEES.indexOf(user) == -1) {
    return false;
  } else {
    return true;
  }
}