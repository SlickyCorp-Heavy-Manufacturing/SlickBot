import { ICommand } from '../icommand';
import { Message, TextChannel } from 'discord.js';
import { Translate } from "./translate";

export const KlingonCommand: ICommand = {
    name: 'Klingon',
    helpDescription: '',
    showInHelp: false,
    trigger: (msg: Message) => !msg.author.username.includes('SlickBot') && !msg.content.startsWith('https://') && (msg.channel as TextChannel).name === 'rikers_stellar_quarters', 
    command: (msg: Message) => Translate.translateToKlingon(msg.content).then((value: string) => msg.channel.send(Translate.DEFAULT_KLINGON_REPLY + value)),
}
