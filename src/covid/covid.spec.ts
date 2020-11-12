import 'jasmine';
import nock from 'nock';
import { DateTime } from 'luxon';
import { DHSData, WICensusData } from './covid-types';

// From https://data.dhsgis.wi.gov/datasets/covid-19-historical-data-by-county/geoservice?orderBy=GEOID
import * as dhsTestData from './dhs_2020-10-27.json';
import * as wiCountyPopData from './wi_county_pop_data_2019.json';

import { Covid } from './covid';

describe('covid', () => {
  it('usDaily() should get US daily numbers', async () => {
    nock('https://api.covidtracking.com')
      .get('/v1/us/current.json')
      .reply(
        200,
        [
          {
            date: 20200819,
            states: 56,
            positive: 5502927,
            negative: 63441940,
            pending: 4374,
            hospitalizedCurrently: 43313,
            hospitalizedCumulative: 353270,
            inIcuCurrently: 8816,
            inIcuCumulative: 16377,
            onVentilatorCurrently: 2371,
            onVentilatorCumulative: 1705,
            recovered: 1925049,
            dateChecked: '2020-08-19T00:00:00Z',
            death: 165011,
            hospitalized: 353270,
            lastModified: '2020-08-19T00:00:00Z',
            total: 68949241,
            totalTestResults: 68944867,
            posNeg: 68944867,
            deathIncrease: 1416,
            hospitalizedIncrease: 2036,
            negativeIncrease: 635831,
            positiveIncrease: 45103,
            totalTestResultsIncrease: 680934,
            hash: '9024bc2f59199a950c965babefbfac6f6c8948eb',
          },
        ],
      );

    const usDailyNumbers = await Covid.usDaily();
    expect(usDailyNumbers).toBe('1416 Americans laid down their lives for Mike\'s tendies today.');
  });

  it('datesToURI() should provide the date string format expected by the DHS site', () => {
    const startDate = DateTime.utc(2020, 10, 27);
    const endDate = DateTime.utc(2020, 10, 28);

    const expectedString = `'${startDate.toISO()}' AND '${endDate.toISO()}'`;
    expect(Covid.datesToURI(startDate, endDate)).toEqual(expectedString);
  });

  it('fullDHSUri should provide the URI string format expected by the DHS site', () => {
    const startDate = DateTime.utc(2020, 10, 27);
    const endDate = DateTime.utc(2020, 10, 28);
    const results = Covid.fullDHSUri(startDate, endDate);
    const expectedURL = 'https://dhsgis.wi.gov/server/rest/services/DHS_COVID19/COVID19_WI/MapServer/12/query?where=DATE%20BETWEEN%20%272020-10-27T00:00:00.000Z%27%20AND%20%272020-10-28T00:00:00.000Z%27%20&outFields=NAME,DATE,POSITIVE,POS_NEW,NEGATIVE,NEG_NEW,DEATHS,DTH_NEW,TEST_NEW,GEO&outSR=4326&f=json';
    expect(results).toEqual(expectedURL);
  });

  it('getDHSData() should provide new WI daily numbers', async () => {
    const startDate = DateTime.utc(2020, 10, 27);
    const endDate = DateTime.utc(2020, 10, 28);
    nock(`${Covid.WI_COVID_API_SERVER}`)
      .get(Covid.WI_COVID_API_URL)

      // Because the DHS URL format does not follow std. query parameters,
      //   you cannot mock it out fully.
      // Either Nock complains that it can't find or format the query parameters,
      //   or Got complains that the URI is invalid.
      // Passing true here allows us to respond regardless of the format of the input parameters,
      //   then I validate at the end.
      .query(true)
      .reply(
        200,
        dhsTestData,
      );

    const dhsResponse = await Covid.getDHSData(startDate, endDate);
    const expectedURL = 'https://dhsgis.wi.gov/server/rest/services/DHS_COVID19/COVID19_WI/MapServer/12/query?where=DATE%20BETWEEN%20%272020-10-27T00:00:00.000Z%27%20AND%20%272020-10-28T00:00:00.000Z%27%20&outFields=NAME,DATE,POSITIVE,POS_NEW,NEGATIVE,NEG_NEW,DEATHS,DTH_NEW,TEST_NEW,GEO&outSR=4326&f=json';
    expect(dhsResponse.request.requestUrl).toEqual(expectedURL);
    expect(JSON.parse(dhsResponse.body)).toEqual(dhsTestData);
  });

  it('bodyToDHSData() should give us typed data', async () => {
    const startDate = DateTime.utc(2020, 10, 27);
    const endDate = DateTime.utc(2020, 10, 28);
    nock(`${Covid.WI_COVID_API_SERVER}`)
      .get(Covid.WI_COVID_API_URL)

      // Because the DHS URL format does not follow std. query parameters,
      //   you cannot mock it out fully.
      // Either Nock complains that it can't find or format the query parameters,
      //   or Got complains that the URI is invalid.
      // Passing true here allows us to respond regardless of the format of the input parameters,
      //   then I validate at the end.
      .query(true)
      .reply(
        200,
        dhsTestData,
      );

    const dhsResponse = await Covid.getDHSData(startDate, endDate);
    expect(Covid.bodyToDHSData(dhsResponse.body)).toEqual(dhsTestData as DHSData);
  });

  it('newWiCases() should sum all of the new cases', async () => {
    const expectedResult = 5262;
    const result = Covid.newWiCases(dhsTestData as DHSData);
    expect(result).toEqual(expectedResult);
  });

  it('newWiDeaths() should sum all of the new deaths', async () => {
    const expectedResult = 64;
    const result = Covid.newWiDeaths(dhsTestData as DHSData);
    expect(result).toEqual(expectedResult);
  });

  it('totalWiCases() should sum all of the total cases', async () => {
    const expectedResult = 206311;
    const result = Covid.totalWiCases(dhsTestData as DHSData);
    expect(result).toEqual(expectedResult);
  });

  it('totalWiDeaths() should sum all of the total deaths', async () => {
    const expectedResult = 1852;
    const result = Covid.totalWiDeaths(dhsTestData as DHSData);
    expect(result).toEqual(expectedResult);
  });

  it('topFiveCountiesByNewCasesPerCapita() should provide a map of the top five counties', async () => {
    const expectedResult: Map<string, number> = new Map();
    expectedResult.set('Fond du Lac', 325.90930630639343);
    expectedResult.set('Langlade', 276.19990619625827);
    expectedResult.set('Menominee', 219.49078138718176);
    expectedResult.set('Brown', 194.67608168079173);
    expectedResult.set('Adams', 178.04154302670622);

    const result = Covid.topFiveCountiesByNewCasesPerCapita(
      dhsTestData as DHSData, wiCountyPopData as WICensusData,
    );
    expect(result).toEqual(expectedResult);
  });

  it('topFiveCountiesByTotalCasesPerCapita() should provide a map of the top five counties', async () => {
    const expectedResult: Map<string, number> = new Map();
    expectedResult.set('Menominee', 6540.825285338015);
    expectedResult.set('Shawano', 5882.784420156972);
    expectedResult.set('Brown', 5709.1123526698975);
    expectedResult.set('Oconto', 5510.150276825731);
    expectedResult.set('Calumet', 5342.490367146479);

    const result = Covid.topFiveCountiesByTotalCasesPerCapita(
      dhsTestData as DHSData, wiCountyPopData as WICensusData,
    );
    expect(result).toEqual(expectedResult);
  });

  it('topFiveCountiesByTotalDeathsPerCapita() should provide a map of the top five counties', async () => {
    const expectedResult: Map<string, number> = new Map();
    expectedResult.set('Florence', 139.69732246798603);
    expectedResult.set('Forest', 111.06175033318524);
    expectedResult.set('Waupaca', 74.52441655226515);
    expectedResult.set('Iron', 70.3358537014243);
    expectedResult.set('Milwaukee', 61.117067734206316);

    const result = Covid.topFiveCountiesByTotalDeathsPerCapita(
      dhsTestData as DHSData, wiCountyPopData as WICensusData,
    );
    expect(result).toEqual(expectedResult);
  });
});
