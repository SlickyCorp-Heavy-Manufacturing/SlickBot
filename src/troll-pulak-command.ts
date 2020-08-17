import { ICommand } from './icommand';
import { Message, TextChannel } from 'discord.js';

export const TrollPulakCommand: ICommand = {
    name: 'TrollJustin',
    helpDescription: '',
    showInHelp: false,
    trigger: (msg: Message) => msg.author.username === 'Pulak' && (msg.channel as TextChannel).name === 'thing-i-would-buy', 
    command: () => {
        return Promise.resolve('https://i.redd.it/ng2ewzvfado21.jpg');
    },
}