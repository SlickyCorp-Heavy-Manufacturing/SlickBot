import * as chai from 'chai';
import { ChannelType, Collection, Message, User } from 'discord.js';
import 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import { Troutslap } from '../../src/troutslap/troutslap.js';

const expect = chai.expect;
chai.use(sinonChai);

describe('Troutslap', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should dm the usage with DM in existing DM channel', async () => {
    // Mock send method
    const mockedSend = sinon.stub().returns(Promise.resolve());

    // Mock Message
    const message = {
      author: {
        dmChannel: {
          send: mockedSend,
        },
      },
      channel: {
        type: ChannelType.DM,
      },
    } as unknown as Message;

    // Execute unit under test
    await Troutslap.slap(message);

    // Verify
    expect(mockedSend).to.have.callCount(1);
    expect(mockedSend.getCall(0).args[0]).to.include('Usage:');
  });

  it('should dm the usage with DM in new DM channel', async () => {
    // Mock methods)
    const mockedSend = sinon.stub().returns(Promise.resolve());
    const mockedCreateDM = sinon.stub().returns(Promise.resolve({send: mockedSend}));

    // Mock Message
    const message = {
      author: {
        createDM: mockedCreateDM,
        dmChannel: null,
      },
      channel: {
        type: ChannelType.DM,
      },
    } as unknown as Message;

    // Execute unit under test
    await Troutslap.slap(message);

    // Verify
    expect(mockedCreateDM).to.have.callCount(1);
    expect(mockedSend).to.have.callCount(1);
    expect(mockedSend.getCall(0).args[0]).to.include('Usage:');
  });

  it('should slap multiple people', async () => {
    // Mock send method
    const mockedSend = sinon.stub().returns(Promise.resolve());

    // Mock Message
    const message = {
      channel: {
        send: mockedSend,
        type: ChannelType.GuildText,
      },
      mentions: {
        users: new Collection<string, User>([
          ['bar', { username: 'bar' } as User],
          ['foo', { username: 'foo' } as User],
        ]),
      },
    } as unknown as Message;

    // Execute unit under test
    await Troutslap.slap(message);

    // Verify
    expect(mockedSend).to.have.callCount(2);
    expect(mockedSend.getCall(0).args[0]).to.include('bar');
    expect(mockedSend.getCall(1).args[0]).to.include('foo');
  });

  it('should slap comma-separated list of people', async () => {
// Mock send method
    const mockedSend = sinon.stub().returns(Promise.resolve());

    // Mock Message
    const message = {
      channel: {
        send: mockedSend,
        type: ChannelType.GuildText,
      },
      cleanContent: '!troutslap foo, bar',
      mentions: {
        users: new Collection<string, User>(),
      },
    } as unknown as Message;

    // Execute unit under test
    await Troutslap.slap(message);

    // Verify
    expect(mockedSend).to.have.callCount(2);
    expect(mockedSend.getCall(0).args[0]).to.include('foo');
    expect(mockedSend.getCall(1).args[0]).to.include('bar');
  });
});
