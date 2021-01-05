import { IScheduledPost } from './ischeduledpost';
import { scheduledTendiesPosts } from './tendies/tendies-schedule';
import { scheduledTweetChecks } from './tweet/tweet-scheduler';
import { scheduledWeatherPosts } from './weather';
import { PulakHairCut } from './haircut/reminder';

export const scheduledPosts: IScheduledPost[] = [
  ...scheduledTendiesPosts,
  ...scheduledTweetChecks,
  ...scheduledWeatherPosts,
  ...PulakHairCut,
];
