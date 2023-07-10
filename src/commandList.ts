import { ICommand } from './icommand';
import { HelpCommand } from './help/help-command';
import { PingCommand } from './ping/ping-command';
import { WeatherCommand } from './weather/weather-command';
import { TrollPulakCommand } from './troll/troll-pulak-command';
import { TroutslapCommand } from './troutslap/troutslap-command';
import { XKCDCommand } from './xkcd';
import { MemeCommand, MemeSearchCommand } from './meme';
import { KlingonCommand } from './klingon/klingon-command';
import { PlayCommand } from './play/play-command';
import {
  CryptoCommand,
  TendiesCommand,
  ShortsCommand,
  SpyCommand,
  EtfCommand,
  WorldCommand,
  DowCommand,
} from './tendies';
import { NiceReaction, ChulasRecation } from './reactions';
import { DevNullCommand } from './dev_null/dev-null-command';
import { FlavorForecastCommand, FlavorOfTheDayCommand } from './kopps';
import { DevOpsCommand, TechTrackCommand } from './teams/teams';
import { EmojifyCommand } from './emojify/emojify';
import { LMGTFYCommand } from './lmgtfy';
import { CocktailRecommendation, GetCocktail } from './cocktail';
import { PlayNowCommand } from './play';
import { MinerStatsCommand } from './miner';
import { DefineCommand } from './dictionary';
import { DalleCommand } from './dalle-mini';

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
  CryptoCommand,
  MinerStatsCommand,
  DefineCommand,
  DalleCommand,
];
