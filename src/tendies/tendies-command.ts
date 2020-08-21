import { Message } from "discord.js";
import { ICommand } from "../icommand";
import { Tendies } from "./tendies";

export const TendiesCommand: ICommand = {
    name: '!tendies',
    helpDescription: 'Bot will respond with the tendie data or random stock if no symbol specified. Usage: !tendies [SYMBOL]',
    showInHelp: true,
    trigger: (msg: Message) => msg.content.startsWith('!tendies'), 
    command: async (msg: Message): Promise<void> => {
        try {
            msg.channel.send(await Tendies.currentTendies(msg.content.replace('!tendies', '').trim()))
        } catch (error) {
            return error.message;
        }
    },
}
