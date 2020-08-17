import { ICommand } from './icommand';
import { Message, TextChannel } from 'discord.js';

export const TrollPulakCommand: ICommand = {
    name: 'TrollJustin',
    helpDescription: '',
    showInHelp: false,
    trigger: (msg: Message) => msg.author.username === 'Pulak' && (msg.channel as TextChannel).name === 'thing-i-would-buy', 
    command: (msg: Message) => {
        const retval = msg.channel.send('https://i.redd.it/ng2ewzvfado21.jpg');
        return Promise.resolve(retval);
    },
}