import * as chai from 'chai';
import { Message } from 'discord.js';
import 'mocha';
import nock from 'nock';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import { DevNullCommand } from '../../src/dev_null/dev-null-command.js';

const expect = chai.expect;

describe('dev-null', () => {
  chai.use(sinonChai);

  it('should send your message to /dev/null', async () => {
    const spy = {
      content: 'tsla 420.69 meme',
      delete: sinon.stub().returns(Promise.resolve({} as any))
    } as unknown as Message<boolean>;
    expect(DevNullCommand.trigger(spy));

    nock('https://devnull-as-a-service.com')
      .post('/dev/null')
      .reply(200, { });

    await DevNullCommand.command(spy);
    expect(spy.delete).to.be.called;
  });
});
