import * as yargs from 'yargs';
// @ts-ignore
import Imgflip from 'imgflip';
import { Message } from 'discord.js';

import FuzzySet from 'fuzzyset.js';

import * as types from './types';
import * as memes from './meme-list';

export class Meme {
    private static MEMES: types.meme[];

    private static TEMPLATE_NAMES: FuzzySet;

    private static async login(): Promise<Imgflip> {
      // https://imgflip.com/signup
      const imgflip = new Imgflip({
        username: process.env.IMGFLIP_USER,
        password: process.env.IMGFLIP_PASS,
      });
      if (!Meme.MEMES) {
        Meme.MEMES = [...await imgflip.memes(), ...memes.memeList];
        this.TEMPLATE_NAMES = FuzzySet(Meme.MEMES.map((x) => x.name));
      }

      return imgflip;
    }

    private static findTemplate(name: string): types.meme {
      const template = this.TEMPLATE_NAMES.get(name);
      if (!template) {
        return Meme.MEMES[69]; // hehe its bad luck brian
      }
      return Meme.MEMES.find((x) => x.name === template[0][1]);
    }

    public static async memeSearch(msg: Message): Promise<String> {
      await this.login();

      const args = yargs.options({
        template: { type: 'string' },
      }).parse(msg.content);

      const template = this.findTemplate(args.template);
      return `${template.name} boxes ${template.boxCount}`;
    }

    public static async getImage(msg: Message): Promise<String> {
      const imgflip = await this.login();

      const args = yargs.options({
        template: { type: 'string', default: 'pigeon' },
        box1: { type: 'string', default: ' ' },
        box2: { type: 'string' },
        box3: { type: 'string' },
        box4: { type: 'string' },
        box5: { type: 'string' },
        box6: { type: 'string' },
      }).parse(msg.content);

      let captions = [
        args.box1,
        args.box2,
        args.box3,
        args.box4,
        args.box5,
        args.box6,
      ];

      captions = captions.filter((x) => x);
      const template = this.findTemplate(args.template);

      if (captions.length > template.boxCount) {
        return `${template.name} requires ${template.boxCount} strings`;
      }

      const img = await imgflip.meme(template.id, {
        captions: captions.filter((x) => x),
      });

      return img;
    }
}
