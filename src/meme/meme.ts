
import * as yargs from 'yargs';
// @ts-ignore
import Imgflip from 'imgflip';
import { Message } from 'discord.js';

import FuzzySet from 'fuzzyset.js';

interface meme {
    box_count: number;
    height: number;
    id: string;
    name: string;
    url: string;
    width: number;
}

export class Meme {
    private static _memes: meme[];
    private static _templateNames: FuzzySet;

    public static async getImage(msg: Message): Promise<String> {
        const args = yargs.options({
            template: { type: 'string', default: `pigeon` },
            box1: { type: 'string' },
            box2: { type: 'string' },
            box3: { type: 'string' },
            box4: { type: 'string' },
        }).parse(msg.content)

        // https://imgflip.com/signup
        const imgflip = new Imgflip({
            username: process.env.IMGFLIP_USER,
            password: process.env.IMGFLIP_PASS
        })
        if (!Meme._memes) {
            Meme._memes = await imgflip.memes();
            this._templateNames = FuzzySet(Meme._memes.map( x => x.name))
        }

        let captions = [
            args.box1,
            args.box2,
            args.box3,
            args.box4,
        ]

        const templateName = this._templateNames.get(args.template)[0][1];
        let template = Meme._memes.find( x => x.name === templateName)

        captions = captions.filter( x => x);

        if(captions.length != template.box_count) {
            return `${template.name} requires ${template.box_count} strings`
        }
        
        const img = await imgflip.meme(template.id, {
            captions: captions.filter( x => x),
        });

        return img;
    }

}