// @ts-ignore
import * as pureimage from 'pureimage';
import fs from 'fs';
import { Message } from 'discord.js';

export class DrawMeme {
  public static async meme(msg: Message): Promise<void> {
    const fnt = pureimage.registerFont('SourceSansPro-Regular.ttf', 'Source Sans Pro');

    const filename = await new Promise<String>((resolve) => {
      fnt.load(() => {
        const img = pureimage.make(200, 200);
        const ctx = img.getContext('2d');
        ctx.fillStyle = '#000000';
        ctx.font = "48pt 'Source Sans Pro'";
        ctx.fillText('ABC', 80, 80);

        pureimage.encodePNGToStream(img, fs.createWriteStream('out.png')).then(() => {
          resolve('out.png');
        });
      });
    });

    await msg.channel.send({ files: [filename] }, { split: false });
    fs.unlink('out.png', () => {});
  }
}
