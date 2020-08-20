import 'jasmine';
import nock from 'nock';

import { Tendies } from './tendies';
import { Daily } from './tendies-types';

describe("tendies", () => {
    const daily: Daily[] = [
        {
            "adjClose": 228.68,
            "adjHigh": 232.49,
            "adjLow": 227.318,
            "adjOpen": 232.0,
            "adjVolume": 701592,
            "close": 228.68,
            "date": "2020-08-19T00:00:00+00:00",
            "divCash": 0.0,
            "high": 232.49,
            "low": 227.318,
            "open": 232.0,
            "splitFactor": 1.0,
            "volume": 701592
        }
    ];

    it("calculatePercentage() calculates percentage", () => {
        expect(Tendies.calculateDailyPercentage(daily[0])).toBeCloseTo(-1.43, 2);
    });

    it("daily() should get most recent stock numbers", async () => {
        nock('https://api.tiingo.com')
            .get('/tiingo/daily/foo/prices')
            .query(true)
            .reply(200, daily);

        const fooDaily = await Tendies.daily('foo');
        expect(fooDaily.open).toEqual(232.0);
    });
});