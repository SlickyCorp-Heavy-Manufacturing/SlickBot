import { Client, TextChannel } from 'discord.js';

export function findChannelByName(client: Client, name: String): TextChannel {
  return client.channels.find((channel) => (channel as TextChannel).name === name) as TextChannel;
}

export function escapeMarkdown(text: String): String {
  const unescaped = text.replace(/\\(\*|_|`|~|\\)/g, '$1'); // unescape any "backslashed" character
  const escaped = unescaped.replace(/(\*|_|`|~|\\)/g, '\\$1'); // escape *, _, `, ~, \
  return escaped;
}
