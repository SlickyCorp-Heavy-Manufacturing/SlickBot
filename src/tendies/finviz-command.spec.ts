import * as chai from 'chai';
import { Message, TextChannel } from 'discord.js';
import 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import { DowCommand, EtfCommand, SpyCommand, WorldCommand } from './finviz-command.js';
import Screenshot from '../screenshot/screenshot.js';
import type ScreenshotOptions from '../screenshot/screenshot-options.js';

const expect = chai.expect;
chai.use(sinonChai);

describe('DowCommand', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should trigger when !dji', () => {
    // Mock Message
    const message = {
      content: '!dji',
    } as unknown as Message;

    // Verify
    expect(DowCommand.trigger(message)).to.be.true;
  });

  it('should trigger when !dow', () => {
    // Mock Message
    const message = {
      content: '!dow',
    } as unknown as Message;

    // Verify
    expect(DowCommand.trigger(message)).to.be.true;
  });

  it('should return gif', async () => {
    // Mock message
    const mockedSend = sinon.stub().returns(Promise.resolve({} as Message<boolean>));
    const mockedMessage = {
      channel: {
        send: mockedSend,
      } as unknown as TextChannel,
    } as unknown as Message;

    // Execute unit under test
    await DowCommand.command(mockedMessage);

    // Verify
    expect(mockedSend).to.have.callCount(1);
    expect(mockedSend.getCall(0).args[0]).to.include('.gif');
  });
});

describe('EtfCommand', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should trigger when !etf', () => {
    // Mock Message
    const message = {
      content: '!etf',
    } as unknown as Message;

    // Verify
    expect(EtfCommand.trigger(message)).to.be.true;
  });

  it('should take screenshot', async () => {
    // Mock Screenshot
    const mockedScreenshot = sinon.stub().returns(Promise.resolve(Uint8Array.from(Buffer.from('foo', 'utf-8'))));
    sinon.stub(Screenshot, 'get').callsFake(mockedScreenshot);

    // Mock message
    const mockedSend = sinon.stub().returns(Promise.resolve({} as Message<boolean>));
    const mockedMessage = {
      channel: {
        send: mockedSend,
      } as unknown as TextChannel,
    } as unknown as Message;

    // Execute unit under test
    await EtfCommand.command(mockedMessage);

    // Verify
    expect(mockedScreenshot).to.have.callCount(1);
    expect((mockedScreenshot.getCall(0).args[0] as ScreenshotOptions).url).to.equal('https://finviz.com/map.ashx?t=etf');
    expect(mockedSend).to.have.callCount(1);
    expect(mockedSend.getCall(0).args[0]).to.deep.equal({
      files: [Buffer.from('foo', 'utf-8')],
    });
  });
});

describe('SpyCommand', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should trigger when !spy', () => {
    // Mock Message
    const message = {
      content: '!spy',
    } as unknown as Message;

    // Verify
    expect(SpyCommand.trigger(message)).to.be.true;
  });

  it('should take screenshot', async () => {
    // Mock Screenshot
    const mockedScreenshot = sinon.stub().returns(Promise.resolve(Uint8Array.from(Buffer.from('foo', 'utf-8'))));
    sinon.stub(Screenshot, 'get').callsFake(mockedScreenshot);

    // Mock message
    const mockedSend = sinon.stub().returns(Promise.resolve({} as Message<boolean>));
    const mockedMessage = {
      channel: {
        send: mockedSend,
      } as unknown as TextChannel,
    } as unknown as Message;

    // Execute unit under test
    await SpyCommand.command(mockedMessage);

    // Verify
    expect(mockedScreenshot).to.have.callCount(1);
    expect((mockedScreenshot.getCall(0).args[0] as ScreenshotOptions).url).to.equal('https://finviz.com/map.ashx?t=spy');
    expect(mockedSend).to.have.callCount(1);
    expect(mockedSend.getCall(0).args[0]).to.deep.equal({
      files: [Buffer.from('foo', 'utf-8')],
    });
  });
});

describe('WorldCommand', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should trigger when !world', () => {
    // Mock Message
    const message = {
      content: '!world',
    } as unknown as Message;

    // Verify
    expect(WorldCommand.trigger(message)).to.be.true;
  });

  it('should take screenshot', async () => {
    // Mock Screenshot
    const mockedScreenshot = sinon.stub().returns(Promise.resolve(Uint8Array.from(Buffer.from('foo', 'utf-8'))));
    sinon.stub(Screenshot, 'get').callsFake(mockedScreenshot);

    // Mock message
    const mockedSend = sinon.stub().returns(Promise.resolve({} as Message<boolean>));
    const mockedMessage = {
      channel: {
        send: mockedSend,
      } as unknown as TextChannel,
    } as unknown as Message;

    // Execute unit under test
    await WorldCommand.command(mockedMessage);

    // Verify
    expect(mockedScreenshot).to.have.callCount(1);
    expect((mockedScreenshot.getCall(0).args[0] as ScreenshotOptions).url).to.equal('https://finviz.com/map.ashx?t=geo');
    expect(mockedSend).to.have.callCount(1);
    expect(mockedSend.getCall(0).args[0]).to.deep.equal({
      files: [Buffer.from('foo', 'utf-8')],
    });
  });
});
