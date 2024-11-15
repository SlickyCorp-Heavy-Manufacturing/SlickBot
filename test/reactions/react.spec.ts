import * as chai from 'chai';
import { Message } from 'discord.js';
import 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import { NiceReaction } from '../../src/reactions/index.js';

const expect = chai.expect;
chai.use(sinonChai);

describe('React', () => {
  describe('Nice', () => {
    it('should send a nice reaction', async () => {
      const spy = {
        content: 'tsla 420.69 meme',
        react: sinon.stub().returns(Promise.resolve({} as any)),
      } as unknown as Message<boolean>;
      expect(NiceReaction.trigger(spy));
      await NiceReaction.command(spy);
      expect(spy.react).to.have.callCount(4);
    });
  });
});
