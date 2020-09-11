import { ICommand } from './icommand';
import { HelpCommand } from './help/help-command';
import { PingCommand } from './ping/ping-command';
import { WeatherCommand } from './weather/weather-command';
import { TrollPulakCommand } from './troll/troll-pulak-command';
import { TroutslapCommand } from './troutslap/troutslap-command';
import { XKCDCommand } from './xkcd';
import { MemeCommand, MemeSearchCommand, DrawMemeCommand } from './meme';
import { KlingonCommand } from './translate/klingon-command';
import { FoffCommand } from './foaas/foaas-command';
import { TendiesCommand, SpyCommand } from './tendies';
import { CovidCommand } from './covid/covid-command';
import { NiceReaction, ChulasRecation } from './reactions';
import { DevNullCommand } from './dev_null/dev-null-command';
import { TrompoCommand, RocketManCommand } from './tweet';

export const commandList: ICommand[] = [
  HelpCommand,
  PingCommand,
  WeatherCommand,
  TrollPulakCommand,
  TroutslapCommand,
  XKCDCommand,
  MemeCommand,
  MemeSearchCommand,
  KlingonCommand,
  FoffCommand,
  TendiesCommand,
  CovidCommand,
  NiceReaction,
  ChulasRecation,
  DevNullCommand,
  DrawMemeCommand,
  TrompoCommand,
  RocketManCommand,
  SpyCommand,
];
