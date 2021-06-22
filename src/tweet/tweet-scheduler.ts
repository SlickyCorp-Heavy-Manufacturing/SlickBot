import { IScheduledPost } from '../ischeduledpost';

import { TwitterApi } from './twitter-api';

export class TweetScheduler {
  /**
   * Get the 10 most recent tweet permalinks of a twitter user that are newer
   * than the specified expiration.
   * @param expiration Don't post any twitters older than this number of minutes.
   * @param username The Twitter username.
   * @param regex [Optional] Only post tweets that match this regular expression.
   */
  public static async getRecentTweets(
    expiration: number,
    username: string,
    regex?: RegExp,
  ): Promise<string[]> {
    // Get most recent tweets
    const user = await TwitterApi.getUserDetails(username);
    const tweets = await TwitterApi.getUserTimeline(parseInt(user.id, 10));

    const now = new Date();

    return tweets
      .filter((tweet) => now.getTime() - tweet.created_at.getTime() > 0)
      .filter((tweet) => now.getTime() - tweet.created_at.getTime() < expiration * 60 * 1000)
      .filter((tweet) => {
        if (regex === undefined) {
          return true;
        }
        return regex.test(tweet.text);
      })
      .map((tweet) => `https://twitter.com/${username}/status/${tweet.id}`)
      .reverse();
  }
}

export const scheduledTweetChecks: IScheduledPost[] = [
  {
    cronDate: '*/5 * * * *',
    channel: '742469521977376980',
    getMessage: () => TweetScheduler.getRecentTweets(5, 'NWSMilwaukee'),
  },
  {
    cronDate: '1 * * * *',
    channel: '679842740124647540',
    getMessage: () => TweetScheduler.getRecentTweets(60, 'ewhispers', /^#earnings for the week\s+/gim),
  },
];
