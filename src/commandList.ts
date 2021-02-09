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
import {
  TendiesCommand,
  ShortsCommand,
  SpyCommand,
  EtfCommand,
  WorldCommand,
} from './tendies';
import { CovidCommand, CovidWiCommand } from './covid/covid-command';
import { NiceReaction, ChulasRecation } from './reactions';
import { DevNullCommand } from './dev_null/dev-null-command';
import { FlavorForecastCommand, FlavorOfTheDayCommand } from './kopps';
import { TrompoCommand, RocketManCommand, TweetCommand } from './tweet';
import { DevOpsCommand, TechTrackCommand } from './teams/teams';
import { EmojifyCommand } from './emojify/emojify';
import { LMGTFYCommand } from './lmgtfy';
import { CocktailRecommendation, GetCocktail } from './cocktail';

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
  TrompoCommand,
  RocketManCommand,
  ShortsCommand,
  SpyCommand,
  EtfCommand,
  WorldCommand,
  PlayCommand,
  DevOpsCommand,
  TechTrackCommand,
  TweetCommand,
  EmojifyCommand,
  LMGTFYCommand,
  CocktailRecommendation,
  GetCocktail,
];
