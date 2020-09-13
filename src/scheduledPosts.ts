import { IScheduledPost } from './ischeduledpost';
import { scheduledWeatherPosts } from './weather';
import { scheduledTendiesPosts } from './tendies/tendies-schedule';
import { PulakHairCut } from './haircut/reminder';

export const scheduledPosts: IScheduledPost[] = [
  ...scheduledTendiesPosts,
  ...scheduledWeatherPosts,
  ...PulakHairCut,
];
