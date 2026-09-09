import * as chai from 'chai';
import { Message } from 'discord.js';
import 'mocha';
import { Readable } from 'node:stream';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import youtubeDl from 'youtube-dl-exec';

import { PlayItemYoutube } from './play-item-youtube.js';

const expect = chai.expect;
chai.use(sinonChai);

describe('PlayItemYoutube', () => {
  it('should force Node as the yt-dlp JavaScript runtime for extraction', async () => {
    const stdout = Readable.from(['audio']);
    const execStub = sinon.stub(youtubeDl, 'exec').returns({ stdout } as any);
    const msg = { reply: sinon.stub().resolves({}) } as unknown as Message;

    const item = new (PlayItemYoutube as any)(msg, 'My Title', 'abc123xyz99', 'https://youtu.be/abc123xyz99', 100);

    await item.createAudioResource();

    expect(execStub).to.have.been.calledWith(
      'https://youtu.be/abc123xyz99',
      sinon.match({
        format: 'bestaudio[acodec=opus]/bestaudio',
        noPlaylist: true,
        output: '-',
        jsRuntimes: 'node'
      })
    );

    execStub.restore();
  });
});
