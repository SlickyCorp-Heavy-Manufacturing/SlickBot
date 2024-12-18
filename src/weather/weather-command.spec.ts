import * as chai from 'chai';
import { Message } from 'discord.js';
import 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import { WeatherCommand } from './weather-command.js';
import { Weather } from './weather.js';

const expect = chai.expect;
chai.use(sinonChai);

describe('WeatherCommand', () => {
  afterEach(() => {
    sinon.restore();
  })

  it('should trigger on !weather message', () => {
    const message = {
      content: '!weather'
    } as Message;

    expect(WeatherCommand.trigger(message)).to.be.true;
  });

  it('should not trigger on not !weather message', () => {
    const message = {
      content: '!whether'
    } as Message;

    expect(WeatherCommand.trigger(message)).to.be.false;
  });

  it('should send current weather', async () => {
    // Mock message
    const mockedSend = sinon.stub().returns(Promise.resolve());
    const message = {
      channel: {
        send: mockedSend
      } as unknown
    } as Message;

    // Mock Weather.currentWeather()
    sinon.stub(Weather, 'currentWeather').callsFake(async () => {
      return Promise.resolve("it's gonna rain");
    });

    // Execute unit under test
    await WeatherCommand.command(message);

    // Verify
    expect(mockedSend).to.have.callCount(1);
    expect(mockedSend.getCall(0).args).to.deep.equal(["it's gonna rain"]);
  });
});
