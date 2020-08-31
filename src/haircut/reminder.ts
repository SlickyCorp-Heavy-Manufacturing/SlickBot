import { IScheduledPost } from '../ischeduledpost';

const IRL_CHANNEL = 'irl';

export const PulakHairCut: IScheduledPost[] = [
  { cronDate: '0 9 * * *', channel: IRL_CHANNEL, getMessage: () => Promise.resolve('@pulak haircut day! Dont forget to wish him a happy haircut!') },
];
