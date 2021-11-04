import { IScheduledPost } from './ischeduledpost';
import { PulakHairCut } from './haircut/reminder';
import { scheduledHangoverCures } from './hungover';
import { scheduledNeweggShufflePosts } from './newegg/newegg-shuffle';
import { scheduledTendiesPosts } from './tendies/tendies-schedule';
import { scheduledTweetChecks } from './tweet/tweet-scheduler';
import { scheduledWeatherPosts } from './weather';

export const scheduledPosts: IScheduledPost[] = [
  ...scheduledHangoverCures,
  ...scheduledTendiesPosts,
  ...scheduledTweetChecks,
  ...scheduledWeatherPosts,
  ...PulakHairCut,
];
