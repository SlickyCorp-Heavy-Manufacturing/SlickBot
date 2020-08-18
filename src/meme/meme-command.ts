import { Message } from 'discord.js';
// @ts-ignore
import Imgflip from 'imgflip';
import { ICommand } from '../icommand';

export const MemeCommand: ICommand = {
    name: '!meme',
    helpDescription: 'Make a meme',
    showInHelp: true,
    trigger: (msg: Message) => msg.content.startsWith('!meme'), 
    command: (msg: Message) => {
        // https://imgflip.com/signup
        const imgflip = new Imgflip({
            username: process.env.IMGFLIP_USER,
            password: process.env.IMGFLIP_PASS
        })
  
        imgflip.meme(`100777631`, {
            captions: [
              `PROGRAMMERS`,
              `THIS PACKAGE`,
              `IS THIS AN AI?`
            ],
            path: `pigeon.png`
          }).then( (value: any) => {
            msg.channel.send(value)
          })
        
    },
}
