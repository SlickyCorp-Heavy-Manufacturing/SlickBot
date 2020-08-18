import { Message } from "discord.js";
import { ICommand } from "../icommand";
import { FOAAS } from "./foaas";

export const InsultCommand: ICommand = {
    name: '!insult',
    helpDescription: 'Bot will insult someone',
    showInHelp: true,
    trigger: (msg: Message) => msg.content === '!insult', 
    command: () => FOAAS.insult()
}