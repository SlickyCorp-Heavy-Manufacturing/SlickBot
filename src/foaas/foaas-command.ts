import { Message } from "discord.js";
import { ICommand } from "../icommand";
import { FOAAS } from "./foaas";

export const FoffCommand: ICommand = {
    name: '!foff',
    helpDescription: 'Bot will says something in German',
    showInHelp: true,
    trigger: (msg: Message) => msg.content.startsWith('!foff'), 
    command: (msg: Message) => FOAAS.insult(msg)
}