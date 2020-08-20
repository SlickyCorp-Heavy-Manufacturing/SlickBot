import { IScheduledPost } from "../ischeduledpost";
import { Weather } from "./weather";

const WEATHER_CHANNEL = 'noaa-information-bureau';

export const scheduledWeatherPosts: IScheduledPost[] = [
    { cronDate: '30 8 * * *', channel: WEATHER_CHANNEL, getMessage: () => Weather.currentWeather() },
    { cronDate: '0 12 * * *', channel: WEATHER_CHANNEL, getMessage: () => Weather.currentWeather() },
    { cronDate: '30 16 * * *', channel: WEATHER_CHANNEL, getMessage: () => Weather.currentWeather() },
];
