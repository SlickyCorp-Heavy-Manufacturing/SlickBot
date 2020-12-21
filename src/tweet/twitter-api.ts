import got, { Response } from "got/dist/source";

export interface UserDetails {
  public_metrics: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
    listed_count: number;
  };
  pinned_tweet_id: string;
  username: string;
  url: string;
  name: string;
  id: string;
  created_at: string;
  protected: boolean;
  profile_image_url: string;
  verified: boolean;
  description: string;
}

export class TwitterApi {
  private static readonly API_URL: string = 'https://api.twitter.com/2';

  private static readonly API_BEARER_TOKEN: string = process.env.TWITTER_BEARER_TOKEN;

  public static async getUserDetails(username: string): Promise<UserDetails> {
    return got(
      `${this.API_URL}/users/by/username/${username}`,
      {
        headers: {
          Authorization: `Bearer ${this.API_BEARER_TOKEN}`,
        },
        responseType: 'json',
        searchParams: {
          'user.fields': 'created_at,description,entities,id,location,name,pinned_tweet_id,profile_image_url,protected,public_metrics,url,username,verified,withheld',
        },
      }
    ).then((response: Response<any>) => response.body.data as UserDetails);
  }
}
