import { IScheduledPost } from "../ischeduledpost";
import { Tendies } from "./tendies";

export const scheduledTendiesPosts: IScheduledPost[] = [
    { cronDate: '0 31 16 * * 1-5', channel: 'nsfw', getMessage: () => Tendies.blakesHappiness() }, // Not available until 5:30 PM Eastern
];
