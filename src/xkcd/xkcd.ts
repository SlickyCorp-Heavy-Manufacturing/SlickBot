import { Message } from 'discord.js';
import { ICommand } from '../icommand';
import got from 'got';

function getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const XKCDCommand: ICommand = {
    name: 'xkcd',
    helpDescription: 'Bot will post xkcd. or todays by appending today',
    showInHelp: true,
    trigger: (msg: Message) => msg.content.startsWith('!xkcd'), 
    command: async (msg: Message) => {
        let xkcd_link: string;
        if(msg.content.includes('today')) {
            xkcd_link = "https://xkcd.com/info.0.json"
        } else {
            const number = getRandomNumber(0, 2000);
            xkcd_link = `https://xkcd.com/${number}/info.0.json`;
        }
        const value = await got(xkcd_link, {responseType: 'json'});
        var image = (value.body as any).img;
        await msg.channel.send(image);
    },
}
