import * as cheerio from 'cheerio';
import { Message } from 'discord.js';
import got from 'got';

export interface TwitterProfile {
  avatar: string;
  name: string;
  nickname: string;
  verified: boolean;
}

export async function getTwitterProfile(nickname: string): Promise<TwitterProfile> {
  const response = await got(`https://mobile.twitter.com/${nickname}`);
  const page = cheerio.load(response.body);
  return Promise.resolve({
    avatar: page('.profile-details .avatar img').attr('src'),
    name: page('.profile-details .fullname').text().trim(),
    nickname,
    verified: page('.profile-details .user-info img[alt="Verified Account"]').length > 0,
  });
}
