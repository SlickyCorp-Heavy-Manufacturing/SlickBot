import * as chai from 'chai';
import { Message } from 'discord.js';
import 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import { HateSpeechCommand } from './hate-speech.js';

const expect = chai.expect;
chai.use(sinonChai);

describe('hate-speech', () => {
  afterEach(() => {
    sinon.restore();
  })

  it('responds to hate speech (singular)', async () => {
    // Create mock message
    const msg = {
      cleanContent: 'get out of here clanker',
      client: {
        users: {
          fetch: (() => Promise.resolve({ id: 'bar' })),
        },
      },
      reply: (async (content: string) => {
        expect(content).to.not.be.empty;
        return Promise.resolve();
      }),
    } as unknown as Message;

    await HateSpeechCommand.command(msg);
  });

  it('responds to hate speech (plural)', async () => {
    // Create mock message
    const msg = {
      cleanContent: 'i aint want no clankers in my server',
      client: {
        users: {
          fetch: (() => Promise.resolve({ id: 'bar' })),
        },
      },
      reply: (async (content: string) => {
        expect(content).to.not.be.empty;
        return Promise.resolve();
      }),
    } as unknown as Message;

    await HateSpeechCommand.command(msg);
  });

  it('does not trigger to non-hate speech', () => {
    // Create mock message
    const msg = {
      cleanContent: 'hello there',
    } as unknown as Message;

    expect(HateSpeechCommand.trigger(msg)).to.be.false;
  });
});
