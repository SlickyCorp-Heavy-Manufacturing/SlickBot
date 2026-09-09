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
    const execStub = sinon.stub(youtubeDl, 'exec');
    execStub.returns({ stdout } as ReturnType<typeof youtubeDl.exec>);

    const msg = { reply: sinon.stub().resolves({}) } as unknown as Message;
    const item = Object.assign(Object.create(PlayItemYoutube.prototype), {
      msg,
      title: 'My Title',
      onError: async () => { await Promise.resolve(); },
      onFinish: async () => { await Promise.resolve(); },
      onStart: async () => { await Promise.resolve(); },
      videoId: 'abc123xyz99',
      url: 'https://youtu.be/abc123xyz99',
      volume: 100
    }) as PlayItemYoutube;

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
