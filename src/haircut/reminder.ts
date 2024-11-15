import { IScheduledPost } from '../ischeduledpost.js';

const IRL_CHANNEL = '614482862363770903';

export const PulakHairCut: IScheduledPost[] = [
  {
    cronDate: '0 9 * * 4',
    channel: IRL_CHANNEL,
    getMessage: (client) => {
      const pulakUser = client.users.cache.find((user) => user.username === 'Pulak');
      return Promise.resolve(`<@${pulakUser.id}> reminder, its haircut day! Don't forget it's tax deductible`);
    },
  },
];
