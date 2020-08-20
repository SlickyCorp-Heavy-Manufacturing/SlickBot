import { Message } from 'discord.js';
import { ICommand } from '../icommand';
import { Meme } from './meme';

export const MemeCommand: ICommand = {
    name: '!meme',
    helpDescription: '!meme --template \"this do pigeon\" --box1 \"text box\" --box2 \"asdf\" --box3 \"asdf\"',
    showInHelp: true,
    trigger: (msg: Message) => msg.content.startsWith('!meme'), 
    command: (msg: Message) => { Meme.getImage(msg).then( message => msg.reply(message)) },
}

export const MemeSearchCommand: ICommand = {
  name: '!meme-search',
  helpDescription: '!meme-search --template "drake"',
  showInHelp: true,
  trigger: (msg: Message) => msg.content.startsWith('!meme-search'), 
  command: (msg: Message) => { Meme.getImage(msg).then( message => msg.reply(message)) },
}