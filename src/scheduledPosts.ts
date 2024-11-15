import { IScheduledPost } from './ischeduledpost.js';
import { PulakHairCut } from './haircut/reminder.js';
import { scheduledHangoverCures } from './hungover/index.js';

export const scheduledPosts: IScheduledPost[] = [
  ...scheduledHangoverCures,
  ...PulakHairCut,
];
