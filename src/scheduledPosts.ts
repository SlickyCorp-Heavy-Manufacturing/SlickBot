import { IScheduledPost } from './ischeduledpost';
import { PulakHairCut } from './haircut/reminder';
import { scheduledHangoverCures } from './hungover';

export const scheduledPosts: IScheduledPost[] = [
  ...scheduledHangoverCures,
  ...PulakHairCut,
];
