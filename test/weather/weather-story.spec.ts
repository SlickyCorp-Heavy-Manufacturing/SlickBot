import { expect } from 'chai';
import 'mocha';
import nock from 'nock';

import { WeatherStory } from '../../src/weather/weather-story.js';

describe('WeatherStory', () => {
  it('should return empty array on first run', async () => {
    const storyPage = '\
      <html>\
        <body>\
          <div id="tabs">\
            <div class="c-tab">\
              <img src="https://www.weather.gov/images/mkx/wxstory/Tab1FileL.png" />\
            </div>\
          </div>\
        </body>\
      </html>\
    ';
    const storyImage = new Buffer('foo', 'utf-8');

    nock('https://www.weather.gov')
      .get('/mkx/weatherstory')
      .reply(200, storyPage)
      .get('/images/mkx/wxstory/Tab1FileL.png')
      .reply(200, storyImage);

    const weatherStories = await WeatherStory.getWeatherStories();
    expect(weatherStories).to.be.an('array').that.is.empty;
  });

  it('should return new image on second run', async () => {
    const storyPage1 = '\
      <html>\
        <body>\
          <div id="tabs">\
            <div class="c-tab">\
              <img src="https://www.weather.gov/images/mkx/wxstory/Tab1FileL.png" />\
            </div>\
          </div>\
        </body>\
      </html>\
    ';
    const storyPage2 = '\
      <html>\
        <body>\
          <div id="tabs">\
            <div class="c-tab">\
              <img src="https://www.weather.gov/images/mkx/wxstory/Tab2FileL.png" />\
            </div>\
          </div>\
        </body>\
      </html>\
    ';
    const storyImage1 = Buffer.from('foo', 'utf-8');
    const storyImage2 = Buffer.from('bar', 'utf-8');

    nock('https://www.weather.gov')
      .get('/mkx/weatherstory')
      .reply(200, storyPage1)
      .get('/images/mkx/wxstory/Tab1FileL.png')
      .reply(200, storyImage1)
      .get('/mkx/weatherstory')
      .reply(200, storyPage2)
      .get('/images/mkx/wxstory/Tab2FileL.png')
      .reply(200, storyImage2);

    const weatherStories1 = await WeatherStory.getWeatherStories();
    expect(weatherStories1).to.be.an('array').that.is.empty;
    const weatherStories2 = await WeatherStory.getWeatherStories();
    expect(weatherStories2).to.have.lengthOf(1);
    expect(weatherStories2[0]).to.deep.equal(Uint8Array.from(Buffer.from('bar', 'utf-8')));
  });
});
