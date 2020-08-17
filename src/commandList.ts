import { ICommand } from './icommand';
import { HelpCommand } from './help-command';
import { PingCommand } from './ping-command';
import { WeatherCommand } from './weather/weather-command';
import { TrollPulakCommand } from './troll-pulak-command';
import { TroutslapCommand } from './troutslap/troutslap-command';

export const commandList: ICommand[] = [
    HelpCommand,
    PingCommand,
    WeatherCommand,
    TrollPulakCommand,
    TroutslapCommand
];