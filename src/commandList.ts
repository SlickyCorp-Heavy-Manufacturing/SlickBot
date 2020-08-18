import { ICommand } from './icommand';
import { HelpCommand } from './help/help-command';
import { PingCommand } from './ping/ping-command';
import { WeatherCommand } from './weather/weather-command';
import { TrollPulakCommand } from './troll/troll-pulak-command';
import { TroutslapCommand } from './troutslap/troutslap-command';
import { XKCDCommand } from './xkcd';
import { MemeCommand } from './meme'
import { KlingonCommand } from './translate/klingon-command';
import { FoffCommand } from './foaas/foaas-command';

export const commandList: ICommand[] = [
    HelpCommand,
    PingCommand,
    WeatherCommand,
    TrollPulakCommand,
    TroutslapCommand,
    XKCDCommand,
    MemeCommand,
    KlingonCommand,
    FoffCommand
];
