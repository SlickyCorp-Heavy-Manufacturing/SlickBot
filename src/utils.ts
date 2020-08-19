import { Client, TextChannel } from 'discord.js';

export function findChannelByName(client: Client, name: String): TextChannel {
    const channel = client.channels.find(channel => (channel as TextChannel).name === name);
    return channel as TextChannel;
}

export function escapeMarkdown(text: String): String {
  var unescaped = text.replace(/\\(\*|_|`|~|\\)/g, '$1'); // unescape any "backslashed" character
  var escaped = unescaped.replace(/(\*|_|`|~|\\)/g, '\\$1'); // escape *, _, `, ~, \
  return escaped;
}
