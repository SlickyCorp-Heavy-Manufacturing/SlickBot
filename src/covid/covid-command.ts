import { ICommand } from '../icommand';
import { Message, TextChannel } from 'discord.js';
import { Covid } from './covid';


export const CovidCommand: ICommand = {
    name: '!covid',
    helpDescription: 'Return the new daily deaths from covid today.',
    showInHelp: true,
    trigger: (msg: Message) => msg.content.startsWith('!covid') && (msg.channel as TextChannel).name === 'covid-tendies', 
    command: async (msg: Message) => {
        const usDaily = await Covid.usDaily()
        msg.channel.send(usDaily);
    },
}
