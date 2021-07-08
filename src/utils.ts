import { Client, TextChannel } from 'discord.js';

export function findChannelByName(client: Client, name: string): TextChannel {
  return client.channels.cache.find(
    (channel) => (channel as TextChannel).name === name,
  ) as TextChannel;
}

export function findChannelById(client: Client, id: string): Promise<TextChannel> {
  return client.channels.fetch(id).then((channel) => channel as TextChannel);
}

export function escapeMarkdown(text: String): String {
  const unescaped = text.replace(/\\(\*|_|`|~|\\)/g, '$1'); // unescape any "backslashed" character
  const escaped = unescaped.replace(/(\*|_|`|~|\\)/g, '\\$1'); // escape *, _, `, ~, \
  return escaped;
}

export function isSlickBotEmployee(user: string): Boolean {
  const SLICK_BOT_EMPLOYEES = ['TestSlickBot', 'TestUserBot', 'SlickBot', 'darrellDAbarrel', '[EliteTerrorist]AbeLincoln', '7u7k0w5k1', 'biternosintaph', 's_kow', 'freedeau', 'krische', 'Pulak'];
  if (SLICK_BOT_EMPLOYEES.indexOf(user) === -1) {
    return false;
  }
  return true;
}

/**
 * Unpin all messages of a channel that were created by the bot user.
 * @param client The discord client
 * @param channel The discord channel
 */
export async function unpinBotMessages(client: Client, channel: TextChannel): Promise<void> {
  const pinnedMessages = await channel.messages.fetchPinned(false);
  pinnedMessages.forEach(async (pinnedMessage) => {
    if (pinnedMessage.author.id === client.user.id) {
      await pinnedMessage.unpin();
    }
  });
}
