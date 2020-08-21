import { Message } from "discord.js";
import { ICommand } from "../icommand";
import { DevNull } from "./dev-null-service";

export const DevNullCommand: ICommand = {
    name: '/dev/null',
    helpDescription: '/dev/null',
    showInHelp: true,
    trigger: (msg: Message) => msg.content.startsWith('/dev/null'), 
    command: async (msg: Message) => {
        await DevNull.devNullaSS(msg.content);
        await msg.delete();
    },
}