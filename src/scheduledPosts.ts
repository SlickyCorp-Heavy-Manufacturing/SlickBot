import { IScheduledPost } from './ischeduledpost.js';
import { PulakHairCut } from './haircut/reminder.js';
import { scheduledHangoverCures } from './hungover/index.js';
import { scheduledWeatherStory } from './weather/weather-story.js';

export const scheduledPosts: IScheduledPost[] = [
  ...scheduledHangoverCures,
  ...PulakHairCut,
  scheduledWeatherStory,
];
