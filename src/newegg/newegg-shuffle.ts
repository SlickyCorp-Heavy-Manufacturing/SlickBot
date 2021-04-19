import { uniq } from 'lodash';

import { IScheduledPost } from '../ischeduledpost';
import { shuffle } from './newegg';

export const scheduledNeweggShufflePosts: IScheduledPost[] = [
  {
    cronDate: '0 5 * * * *',
    channel: '715723681304674304',
    getMessage: async (): Promise<string> => {
      try {
        const lotteryData = await shuffle();
        const duration = (new Date().valueOf()) - lotteryData.LotteryStartDate.valueOf();
        if (duration > 0 && duration < 3600000) {
          // A shuffle has started within the past hour
          const items = uniq(lotteryData.LotteryItems.map((item) => item.Tag)).sort();
          return Promise.resolve(
            `A Newegg Product Shuffle has started, the following items are available: **${items.join(', ')}**\nhttps://www.newegg.com/product-shuffle`,
          );
        }
      } catch (error) {
        console.log('Error occurred checking for Newegg Shuffle: %s', error.message);
      }
      return Promise.resolve(undefined);
    },
  },
];
