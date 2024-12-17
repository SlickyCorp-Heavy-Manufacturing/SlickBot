import { Client, MessageCreateOptions, MessagePayload } from 'discord.js';

export interface IScheduledPost {
    cronDate: string;
    channel: string;
    getMessage: (client: Client) => Promise<string | string[] | MessagePayload | MessageCreateOptions | MessagePayload[] | MessageCreateOptions[] | undefined>;
    pinMessage?: boolean;
}
