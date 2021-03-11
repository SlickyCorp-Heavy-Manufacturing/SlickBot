import Discord from 'discord.js';
import { IScheduledPost } from '../ischeduledpost';
import { findChannelByName } from '../utils';

import { TwitterApi } from './twitter-api';

export class TweetScheduler {
  /**
   * Get the 10 most recent tweet permalinks of a twitter user that haven't
   * already been posted to the specified channel.
   * @param client The Discord client.
   * @param channel The Discord channel.
   * @param username The Twitter username.
   */
  public static async getUnpostedTweets(
    client: Discord.Client,
    channel: string,
    username: string,
    regex?: RegExp,
  ): Promise<string[]> {
    // Get most recent tweets
    const user = await TwitterApi.getUserDetails(username);
    const tweets = await TwitterApi.getUserTimeline(parseInt(user.id, 10));

    // Get 50 most recent posts in the channel
    const posts = await findChannelByName(client, channel).messages.fetch({ limit: 100 }, false);

    return tweets
      .filter((tweet) => !posts.some((post) => post.content.includes(tweet.id.toString())))
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
    channel: 'noaa-information-bureau',
    getMessage: (client: Discord.Client) => TweetScheduler.getUnpostedTweets(client, 'noaa-information-bureau', 'NWSMilwaukee'),
  },
];
