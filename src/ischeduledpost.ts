import Discord from 'discord.js';

export interface IScheduledPost {
    cronDate: string;
    channel: string;
    getMessage: (client: Discord.Client) => Promise<string | string[] | undefined>;
    pinMessage?: boolean;
}
