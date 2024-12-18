import * as chai from 'chai';
import { Message } from 'discord.js';
import 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import { NiceReaction } from './index.js';

const expect = chai.expect;
chai.use(sinonChai);

describe('React', () => {
  describe('Nice', () => {
    it('should send a nice reaction', async () => {
      const stubbedReact = sinon.stub().returns(Promise.resolve({} as any));
      const spy = {
        content: 'tsla 420.69 meme',
        react: stubbedReact,
      } as unknown as Message<boolean>;
      expect(NiceReaction.trigger(spy));
      await NiceReaction.command(spy);
      expect(stubbedReact).to.have.callCount(4);
    });
  });
});
