import * as chai from 'chai';
import { ChannelType, Collection, Message, User } from 'discord.js';
import 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import { TroutslapCommand } from '../../src/troutslap/troutslap-command.js';
import { Troutslap } from '../../src/troutslap/troutslap.js';

const expect = chai.expect;
chai.use(sinonChai);

describe('TroutslapCommand', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should trigger when !troutslap', async () => {
    // Mock Message
    const message = {
      content: '!troutslap foo',
    } as unknown as Message;

    // Verify
    expect(TroutslapCommand.trigger(message)).to.be.true;
  });

  it('should not trigger when not !troutslap', async () => {
    // Mock Message
    const message = {
      content: '!tunaslap foo',
    } as unknown as Message;

    // Verify
    expect(TroutslapCommand.trigger(message)).to.be.false;
  });

  it('should call slap command', async () => {
    // Mock method
    const mocked = sinon.stub(Troutslap, 'slap').returns(Promise.resolve());

    // Execute unit under test
    await TroutslapCommand.command({} as Message);

    // Verify
    expect(mocked).to.have.callCount(1);
  });
});
