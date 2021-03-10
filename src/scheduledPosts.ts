import { IScheduledPost } from './ischeduledpost';
import { scheduledTendiesPosts } from './tendies/tendies-schedule';
import { scheduledTweetChecks } from './tweet/tweet-scheduler';
import { scheduledWeatherPosts } from './weather';
import { PulakHairCut } from './haircut/reminder';
import { scheduledHangoverCures } from './hungover';

export const scheduledPosts: IScheduledPost[] = [
  ...scheduledHangoverCures,
  ...scheduledTendiesPosts,
  ...scheduledTweetChecks,
  ...scheduledWeatherPosts,
  ...PulakHairCut,
];
