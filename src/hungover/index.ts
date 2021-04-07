import Discord from 'discord.js';
import { sample } from 'lodash';

import { IScheduledPost } from '../ischeduledpost';
import { findChannelById } from '../utils';

const CHANNEL = '614482862363770903';
const HANGOVER_CURES = [
  '**eating a good breakfast**:\n> Eating a hearty breakfast is one of the most well-known remedies for a hangover.',
  '**getting plenty of sleep**:\n> Alcohol can cause sleep disturbances and may be associated with decreased sleep quality and duration for some individuals.',
  '**staying hydrated**:\n> Drinking alcohol can lead to dehydration in a few different ways.',
  '**having a drink the next morning**:\n> Also known as “hair of the dog,” many people swear by this common hangover remedy.',
  '**trying some of these supplements**:\n> Below are a few supplements that have been researched for their ability to reduce hangover symptoms:\n> • Red ginseng: One study found that supplementing with red ginseng reduced blood alcohol levels, as well as hangover severity.\n> • Prickly pear: Some evidence shows that this type of cactus could help treat hangovers. A 2004 study found that prickly pear extract decreased hangover symptoms and cut the risk of hangover severity in half (14Trusted Source).\n> • Ginger: One study found that combining ginger with brown sugar and tangerine extract improved several hangover symptoms, including nausea, vomiting and diarrhea.\n> • Borage oil: One study looked at the effectiveness of a supplement containing both prickly pear and borage oil, an oil derived from the seeds of starflower. The study found that it reduced hangover symptoms in 88% of participants.\n> • Eleuthero: Also known as Siberian ginseng, one study found that supplementing with eleuthero extract alleviated several hangover symptoms and decreased overall severity.',
  '**avoiding drinks with congeners**:\n> Through the process of ethanol fermentation, sugars are converted into carbon dioxide and ethanol, also known as alcohol.\n> Congeners are toxic chemical by-products that are also formed in small amounts during this process, with different alcoholic beverages contain varying amounts.\n> • Drinks that are low in congeners include vodka, gin and rum, with vodka containing almost no congeners at all.\n> • Meanwhile, tequila, whiskey and cognac are all high in congeners, with bourbon whiskey containing the highest amount.',
];
const HUNGOVER_ROLE = '819072708951146547';

async function hangoverCures(
  client: Discord.Client,
): Promise<string[]> {
  const messages: string[] = [];
  const channel = await findChannelById(client, CHANNEL);
  const role = await channel.guild.roles.fetch(HUNGOVER_ROLE);
  role.members.each((member) => {
    messages.push(`${member.user} it looks like you're hungover, I suggest ${sample(HANGOVER_CURES)}`);
  });

  return messages;
}

export const scheduledHangoverCures: IScheduledPost[] = [
  {
    cronDate: '0 8 * * *',
    channel: CHANNEL,
    getMessage: (client: Discord.Client) => hangoverCures(client),
  },
];
