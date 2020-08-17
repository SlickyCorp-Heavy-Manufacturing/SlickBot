import { Message } from 'discord.js';

export interface ICommand {
    name: string;
    helpDescription: string;
    trigger: (message: Message) => boolean;
    command: (...args: any[]) => Promise<string>;
}