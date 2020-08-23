import 'jasmine';
import nock from 'nock';

import { Weather } from './weather';

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
    expect(weather).toBe('Tonight its gonna rain');
  });
});
