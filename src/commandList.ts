import { ICommand } from './icommand';
import { HelpCommand } from './help/help-command';
import { PingCommand } from './ping/ping-command';
import { WeatherCommand } from './weather/weather-command';
import { TrollPulakCommand } from './troll/troll-pulak-command';
import { TroutslapCommand } from './troutslap/troutslap-command';
import { XKCDCommand } from './xkcd';
import { MemeCommand, MemeSearchCommand, DrawMemeCommand } from './meme';
import { KlingonCommand } from './klingon/klingon-command';
import { PlayCommand } from './play/play-command';
import { FoffCommand } from './foaas/foaas-command';
import { TendiesCommand, SpyCommand, EtfCommand } from './tendies';
import { CovidCommand, CovidWiCommand } from './covid/covid-command';
import { NiceReaction, ChulasRecation } from './reactions';
import { DevNullCommand } from './dev_null/dev-null-command';
import { FlavorForecastCommand, FlavorOfTheDayCommand } from './kopps';
import { APCommand, BidenCommand, TrompoCommand, RocketManCommand } from './tweet';
import { DevOpsCommand } from './devops/devops';

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
  CovidWiCommand,
  NiceReaction,
  ChulasRecation,
  DevNullCommand,
  DrawMemeCommand,
  FlavorForecastCommand,
  FlavorOfTheDayCommand,
  APCommand,
  BidenCommand,
  TrompoCommand,
  RocketManCommand,
  SpyCommand,
  EtfCommand,
  PlayCommand,
  DevOpsCommand,
];
