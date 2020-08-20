import { IScheduledPost } from './ischeduledpost';
import { scheduledWeatherPosts } from './weather';
import { scheduledTendiesPosts } from './tendies/tendies-schedule';

export const scheduledPosts: IScheduledPost[] = [
    ...scheduledTendiesPosts,
    ...scheduledWeatherPosts,
];
