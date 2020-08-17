import { Message } from "discord.js";
import { ICommand } from "../icommand";
import { Weather } from "./weather";

export const WeatherCommand: ICommand = {
    name: '!weather',
    helpDescription: 'Bot will respond with the weather',
    showInHelp: true,
    trigger: (msg: Message) => msg.content === '!weather', 
    command: () => Weather.currentWeather()
}