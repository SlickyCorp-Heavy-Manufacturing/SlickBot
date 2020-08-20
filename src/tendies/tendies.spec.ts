import 'jasmine';
import nock from 'nock';

import { Tendies } from './tendies';

describe("tendies", () => {
    it("calculatePercentage() calculates percentage", () => {
        expect(Tendies.calculatePercentage(1, 2, 1)).toEqual(100);
    });

    it("calculatePercentage() calculates percentage with split factor", () => {
        expect(Tendies.calculatePercentage(1, 2, 2)).toEqual(300);
    });

    it("daily() should get most recent stock numbers", async () => {
        const daily = [
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

        nock('https://api.tiingo.com')
            .get('/tiingo/daily/foo/prices')
            .query(true)
            .reply(200, daily);

        const fooDaily = await Tendies.daily('foo');
        expect(fooDaily.open).toEqual(232.0);
    });
});