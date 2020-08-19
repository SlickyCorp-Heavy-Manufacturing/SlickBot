import { Message } from "discord.js";
import { ICommand } from "../icommand";
import { FOAAS } from "./foaas";

export const FoffCommand: ICommand = {
    name: '!foff',
    helpDescription: 'Bot will say a random f*&k off message',
    showInHelp: true,
    trigger: (msg: Message) => msg.content.startsWith('!foff'), 
    command: (msg: Message) => FOAAS.foff(msg).then((value: string) => msg.channel.send(value)),
}