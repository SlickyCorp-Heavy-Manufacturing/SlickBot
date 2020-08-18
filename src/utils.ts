import { Client, TextChannel } from 'discord.js';

export function findChannelByName(client: Client, name: String): TextChannel {
    const channel = client.channels.find(channel => (channel as TextChannel).name === name);
    return channel as TextChannel;
}
