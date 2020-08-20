import { Message } from "discord.js";
import { ICommand } from "../icommand";
import { Tendies } from "./tendies";

export const TendiesCommand: ICommand = {
    name: '!tendies',
    helpDescription: 'Bot will respond with the tendie forcast',
    showInHelp: true,
    trigger: (msg: Message) => msg.content.startsWith('!tendies'), 
    command: (msg: Message) => Tendies.currentTendies(msg.content.replace('!tendies', '').trim()).then((value: string) => msg.channel.send(value)),
}