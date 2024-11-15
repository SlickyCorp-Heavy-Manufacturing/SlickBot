import { Client } from 'discord.js';

export interface IScheduledPost {
    cronDate: string;
    channel: string;
    getMessage: (client: Client) => Promise<string | string[] | undefined>;
    pinMessage?: boolean;
}
