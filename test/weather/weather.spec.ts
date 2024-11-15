import { expect } from 'chai';
import 'mocha';
import nock from 'nock';

import { Weather } from '../../src/weather/weather.js';

describe('Weather', () => {
  it('should get current weather', async () => {
    const forcast = {
      properties: {
        periods: [
          {
            name: 'Tonight',
            detailedForecast: 'its gonna rain',
          },
        ],
      },
    };

    nock('https://api.weather.gov')
      .get('/zones/land/WIZ066/forecast')
      .reply(200, { ...forcast });

    const weather = await Weather.currentWeather();
    expect(weather).to.equal('Tonight its gonna rain');
  });
});
