import { Message } from "discord.js";
import { ICommand } from "../icommand";
import { Tendies } from "./tendies";

export const TendiesCommand: ICommand = {
    name: '!tendies',
    helpDescription: 'Bot will respond with the tendie data or random stock if no symbol specified. Usage: !tendies [SYMBOL]',
    showInHelp: true,
    trigger: (msg: Message) => msg.content.startsWith('!tendies'), 
    command: (msg: Message) => Tendies.tendies(msg.content.replace('!tendies', '').trim()).then((value: string) => msg.channel.send(value)),
}
