import { IScheduledPost } from '../ischeduledpost';
import { Tendies } from './tendies';

export const scheduledTendiesPosts: IScheduledPost[] = [
  { cronDate: '0 1 15 * * 1-5', channel: '619704904696594493', getMessage: () => Tendies.blakesHappiness() }, // Markets typically close at 4:00 PM Eastern
];
