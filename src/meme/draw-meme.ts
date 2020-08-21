
// @ts-ignore
import * as pureimage from 'pureimage';
const fs = require('fs');
import Discord, { Message } from 'discord.js';

export class DrawMeme {
    public static async meme(msg: Message): Promise<void> {
        var fnt = pureimage.registerFont('SourceSansPro-Regular.ttf','Source Sans Pro');
        fnt.load(() => {
            var img = pureimage.make(200,200);
            var ctx = img.getContext('2d');
            ctx.fillStyle = '#000000';
            ctx.font = "48pt 'Source Sans Pro'";
            ctx.fillText("ABC", 80, 80);
            const embed = new Discord.RichEmbed()
            .setImage("attachment://name.png");

            //const buffer: Buffer = Buffer.alloc(10000);

           // pureimage.encodePNGToStream(img, buffer);
            pureimage.encodePNGToStream(img, fs.createWriteStream('out.png'))

           // msg.channel.send({ embed: embed, files: [new Discord.Attachment(buffer, 'name.png')] });
        });
    }
}