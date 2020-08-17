import { ICommand } from './icommand';
import { HelpCommand } from './help';
import { PingCommand } from './ping';
import { WeatherCommand } from './weather';

export const commandList: ICommand[] = [
    HelpCommand,
    PingCommand,
    WeatherCommand,
];