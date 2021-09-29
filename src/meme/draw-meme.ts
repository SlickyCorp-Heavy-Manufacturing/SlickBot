// @ts-ignore
import * as pureimage from 'pureimage';
import stream from 'stream';
import { Message } from 'discord.js';

export class DrawMeme {
  public static async meme(msg: Message): Promise<void> {
    const fnt = pureimage.registerFont(
      'SourceSansPro-Regular.ttf',
      'Source Sans Pro',
      400,
      'normal',
      'Regular',
    );

    fnt.load(() => {
      const img = pureimage.make(200, 200, {});
      const ctx = img.getContext('2d');
      ctx.fillStyle = '#000000';
      ctx.font = { family: 'Source Sans Pro', size: 48 };
      ctx.fillText('ABC', 80, 80);

      const passThroughStream = new stream.PassThrough();
      pureimage.encodePNGToStream(img, passThroughStream).then(() => {
        msg.channel.send({ files: [passThroughStream], split: false });
      });
    });
  }
}
