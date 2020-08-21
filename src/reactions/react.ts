import { Message } from "discord.js";
import { ICommand } from "../icommand";

export const NiceReaction: ICommand = {
    name: 'nice reaction',
    helpDescription: '',
    showInHelp: false,
    trigger: (msg: Message) => (msg.content.includes('69') && !msg.content.startsWith('http')), 
    command: (msg: Message) => {
        msg.react('🇳')
        .then(() => msg.react('🇮'))
        .then(() => msg.react('🇨'))
        .then(() => msg.react('🇪'))
    },
}