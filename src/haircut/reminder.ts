import Discord from 'discord.js';
import { IScheduledPost } from '../ischeduledpost';

const IRL_CHANNEL = 'irl';

export const PulakHairCut: IScheduledPost[] = [
  {
    cronDate: '0 9 * * 2',
    channel: IRL_CHANNEL,
    getMessage: (client) => {
      const pulakUser = client.users.cache.find((user) => user.username === 'Pulak');
      return Promise.resolve(`<@${pulakUser.id}> reminder, its haircut day! Don't forget it's tax deductible`);
    },
  },
];
