import * as chai from 'chai';
import { Message } from 'discord.js';
import 'mocha';
import nock from 'nock';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import { DevNullCommand } from './dev-null-command.js';

const expect = chai.expect;
chai.use(sinonChai);

describe('dev-null', () => {
  it('should send your message to /dev/null', async () => {
    const stubbedDelete = sinon.stub().returns(Promise.resolve({} as any));
    const spy = {
      content: 'tsla 420.69 meme',
      delete: stubbedDelete,
    } as unknown as Message<boolean>;
    expect(DevNullCommand.trigger(spy));

    nock('https://devnull-as-a-service.com')
      .post('/dev/null')
      .reply(200, { });

    await DevNullCommand.command(spy);
    expect(stubbedDelete).to.be.called;
  });
});
