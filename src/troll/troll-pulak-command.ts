import { ICommand } from '../icommand';
import { Message, TextChannel } from 'discord.js';

export const TrollPulakCommand: ICommand = {
    name: 'TrollJPulak',
    helpDescription: '',
    showInHelp: false,
    trigger: (msg: Message) => msg.author.username === 'Pulak' && (msg.channel as TextChannel).name === 'thing-i-would-buy', 
    command: async (msg: Message) => {
        await msg.channel.send('https://i.redd.it/ng2ewzvfado21.jpg');
    }
}