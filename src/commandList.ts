import { ICommand } from './icommand.js';
import { HelpCommand } from './help/help-command.js';
import { PingCommand } from './ping/ping-command.js';
import { WeatherCommand } from './weather/weather-command.js';
import { TroutslapCommand } from './troutslap/troutslap-command.js';
import { MemeCommand, MemeSearchCommand } from './meme/index.js';
import { KlingonCommand } from './klingon/klingon-command.js';
import { PlayCommand } from './play/play-command.js';
import {
  TendiesCommand,
  ShortsCommand,
  SpyCommand,
  EtfCommand,
  WorldCommand,
  DowCommand,
} from './tendies/index.js';
import { NiceReaction, ChulasRecation } from './reactions/index.js';
import { DevNullCommand } from './dev_null/dev-null-command.js';
import { FlavorForecastCommand, FlavorOfTheDayCommand } from './kopps/index.js';
import { DevOpsCommand, TechTrackCommand } from './teams/teams.js';
import { EmojifyCommand } from './emojify/emojify.js';
import { LMGTFYCommand } from './lmgtfy/index.js';
import { CocktailRecommendation, GetCocktail } from './cocktail/index.js';
import { PlayNowCommand } from './play/index.js';
import { DefineCommand } from './dictionary/index.js';
import { DalleCommand } from './dalle-mini/index.js';

export const commandList: ICommand[] = [
  HelpCommand,
  PingCommand,
  WeatherCommand,
  TroutslapCommand,
  MemeCommand,
  MemeSearchCommand,
  KlingonCommand,
  TendiesCommand,
  NiceReaction,
  ChulasRecation,
  DevNullCommand,
  FlavorForecastCommand,
  FlavorOfTheDayCommand,
  ShortsCommand,
  SpyCommand,
  DowCommand,
  EtfCommand,
  WorldCommand,
  PlayCommand,
  PlayNowCommand,
  DevOpsCommand,
  TechTrackCommand,
  EmojifyCommand,
  LMGTFYCommand,
  CocktailRecommendation,
  GetCocktail,
  DefineCommand,
  DalleCommand,
];
