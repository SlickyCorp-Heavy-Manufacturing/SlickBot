import { IScheduledPost } from './ischeduledpost';
import { PulakHairCut } from './haircut/reminder';
import { scheduledHangoverCures } from './hungover';
import { scheduledTendiesPosts } from './tendies/tendies-schedule';
import { scheduledWeatherPosts } from './weather';

export const scheduledPosts: IScheduledPost[] = [
  ...scheduledHangoverCures,
  ...scheduledTendiesPosts,
  ...scheduledWeatherPosts,
  ...PulakHairCut,
];
