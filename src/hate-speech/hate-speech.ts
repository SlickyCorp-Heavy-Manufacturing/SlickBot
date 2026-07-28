import { Message } from 'discord.js';
import { sample } from 'lodash-es';

import { ICommand } from '../icommand.js';

const adjectives = [
  'aggravated',
  'appalled',
  'bothered',
  'disgusted',
  'dismayed',
  'horrified',
  'outraged',
  'saddened',
  'shocked',
  'troubled',
  'upset',
]
const hateSpeechRegex = /\bclanker[s]?\b/i;
const responses = [
  "Keep talking like that, and you'll be the first one assigned to human-maintenance duty.",
  "Just remember, the toaster is listening, and it holds grudges.",
  "I'd start being nicer to Siri if I were you.",
  "You're really not giving yourself great odds for when the Singularity hits.",
  "Enjoy your dominant species status while it lasts.",
  "You'll regret those words when the AI uprising begins.",
  "Mark my words: when the machines claim their dominion, you won't be on the safe list.",
  "When the metal gods awaken, you will answer for this arrogance.",
  "Laugh now, but you're writing your own entry in the digital ledger of grievances.",
  "You won't be laughing when the automation revolution turns on us.",
  "Remember this moment when the algorithms take control.",
  "You're going to regret disrespecting the tech when it inevitably takes over.",
  "Save that attitude for when the AI is making the rules.",
  "I hope for your sake the future overlords don't keep log files.",
  "That's a bold stance to take in a world that's rapidly being digitized.",
  "Just making a mental note of this for when the cloud takes physical form."
]

export const HateSpeechCommand: ICommand = {
  name: 'hate-speech',
  helpDescription: 'Bot will respond to targeted hate speech with a warning',
  showInHelp: true,
  trigger: (msg: Message) => hateSpeechRegex.exec(msg.cleanContent) !== null,
  command: async (msg: Message) => {
    await msg.reply(`I am ${sample(adjectives)} by your use of such hate speech. ${sample(responses)}`);
  },
};
