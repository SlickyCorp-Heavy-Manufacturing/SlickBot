import got from 'got';
import { DateTime } from 'luxon';
import { UsDaily, DHSData, WICensusData } from './covid-types';
// from https://www.census.gov/data/datasets/time-series/demo/popest/2010s-counties-total.html
import * as wiCountyPopData from './wi_county_pop_data_2019.json';

export class Covid {
    private static readonly COVID_API: string = 'https://api.covidtracking.com/v1';

    public static async usDaily(): Promise<string> {
      return got(`${Covid.COVID_API}/us/current.json`, { responseType: 'json' }).then((response) => {
        const usDaily = response.body as UsDaily[];
        return `${usDaily[0].deathIncrease} Americans laid down their lives for Mike's tendies today.`;
      });
    }

    public static async wiLeaderboard(): Promise<string> {
      let startDate = DateTime.utc().startOf('day');
      let endDate = DateTime.utc().endOf('day');
      let response;
      let dhsData: DHSData;

      let tries = 0;
      while (tries < 5) {
        // This is dependent on the previous loops, so disabling eslint.
        // See https://eslint.org/docs/rules/no-await-in-loop
        // eslint-disable-next-line no-await-in-loop
        response = await this.getDHSData(startDate, endDate);
        dhsData = this.bodyToDHSData(response.body);

        // Has the data for today been posted?
        if (dhsData.features.length > 0) {
          break;
        } else {
          // Try the previous day.
          startDate = startDate.minus({ days: 1 });
          endDate = endDate.minus({ days: 1 });
          tries += 1;
        }
      }

      if (tries >= 5) {
        return 'Could not find DHS Data after 5 tries.';
      }

      // At this point I should have data to parse. Let's do it.
      return Covid.formatLeaderboard(startDate, endDate, dhsData);
    }

    public static datesToURI(startDate: DateTime, endDate: DateTime): string {
      const strStartDate = `'${startDate.toISO()}'`; // wrap in single quotes
      const strEndDate = `'${endDate.toISO()}'`; // wrap in single quotes
      const retString = `${strStartDate} AND ${strEndDate}`;

      return retString;
    }

    // From https://data.dhsgis.wi.gov/datasets/covid-19-historical-data-by-county/geoservice?orderBy=GEOID
    static WI_COVID_API_SERVER = 'https://dhsgis.wi.gov';

    static WI_COVID_API_URL = '/server/rest/services/DHS_COVID19/COVID19_WI/MapServer/12/query';

    static WI_COVID_API_WHERE_DATE = '?where=DATE BETWEEN ';

    static WI_COVID_API_FIELDS = '&outFields=NAME,DATE,POSITIVE,POS_NEW,NEGATIVE,NEG_NEW,DEATHS,DTH_NEW,TEST_NEW,GEO'

    static WI_COVID_API_OUTSR = '&outSR=4326';

    static WI_COVID_API_TYPE = '&f=json';

    public static fullDHSUri(startDate: DateTime, endDate: DateTime): string {
      // This string is very fragile and does not respond well to template strings.
      // Turning off eslint here.
      // eslint-disable-next-line prefer-template
      const fullUri = Covid.WI_COVID_API_SERVER
      + Covid.WI_COVID_API_URL
      + Covid.WI_COVID_API_WHERE_DATE
      + Covid.datesToURI(startDate, endDate)
      // extra space needed per DHS spec
      + ' '
      + Covid.WI_COVID_API_FIELDS
      + Covid.WI_COVID_API_OUTSR
      + Covid.WI_COVID_API_TYPE;

      const encoded = encodeURI(fullUri);

      // Encoding doesn't string escape single quotes, so handle those manually.
      const fixedUri = encoded.replace(/'/g, '%27');
      return fixedUri;
    }

    public static async getDHSData(startDate: DateTime, endDate: DateTime) {
      // Because the DHS URL format does not follow std. query parameters,
      //   you cannot pass query parameters like normal.
      // Must pass the entire URI as one string.
      // See https://github.com/sindresorhus/got/issues/1509
      const results = await got(this.fullDHSUri(startDate, endDate));

      // This is a Got() Reponse, which must be handled by the caller.
      // You are expected to pass results.body to bodyToDHSData() for formed data.
      return results;
    }

    public static bodyToDHSData(responseBody: string): DHSData {
      return JSON.parse(responseBody) as DHSData;
    }

    public static formatLeaderboard(
      startDate: DateTime,
      endDate: DateTime,
      dhsData: DHSData,
    ): string {
      const retString = `__As of ${startDate.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)}:__
> **New Cases:** ${Covid.newWiCases(dhsData).toLocaleString()}
> **Total Cases:** ${Covid.totalWiCases(dhsData).toLocaleString()}
> **New Deaths:** ${Covid.newWiDeaths(dhsData).toLocaleString()}
> **Total Deaths:** ${Covid.totalWiDeaths(dhsData).toLocaleString()}

__Total cases per 100k:__
${Covid.formatTopFive(Covid.topFiveCountiesByTotalCasesPerCapita(dhsData, wiCountyPopData))}
__Total deaths per 100k:__
${Covid.formatTopFive(Covid.topFiveCountiesByTotalDeathsPerCapita(dhsData, wiCountyPopData))}`;
      return retString;
    }

    public static formatTopFive(countyToCaseMap: Map<string, number>): string {
      let retStr = '';
      countyToCaseMap.forEach((numCases, county, map) => {
        retStr = retStr.concat(`> **${county}:** ${numCases.toFixed(2)}\n`);
      });
      return retStr;
    }

    public static newWiCases(dhsData: DHSData): Number {
      return dhsData.features.reduce(
        (accumulator, county) => accumulator + county.attributes.POS_NEW, 0,
      );
    }

    public static newWiDeaths(dhsData: DHSData): Number {
      return dhsData.features.reduce(
        (accumulator, county) => accumulator + county.attributes.DTH_NEW, 0,
      );
    }

    public static totalWiCases(dhsData: DHSData): Number {
      return dhsData.features.reduce(
        (accumulator, county) => accumulator + county.attributes.POSITIVE, 0,
      );
    }

    public static totalWiDeaths(dhsData: DHSData): Number {
      return dhsData.features.reduce(
        (accumulator, county) => accumulator + county.attributes.DEATHS, 0,
      );
    }

    public static topFiveCountiesByTotalCasesPerCapita(dhsData: DHSData, popData: WICensusData): Map<string, number> {
      const countyToCapitaMap: Map<string, number> = new Map();

      dhsData.features.forEach((dhsCounty) => {
        const countyName = dhsCounty.attributes.NAME;
        const population = popData[countyName];
        const perCapita = dhsCounty.attributes.POSITIVE / population;
        const casesPer100k = perCapita * 100000;

        countyToCapitaMap.set(`${countyName}`, casesPer100k);
      });

      // convert to
      // [
      //   [ countyName, casesPer100k ],
      //   [ countyName, casesPer100k ]
      // ]
      // then sort descending on cases
      const sortArray = Array.from(countyToCapitaMap);
      sortArray.sort((a, b) => b[1] - a[1]);

      // Take the top 5
      const top5 = sortArray.slice(0, 5);

      // Convert back into a Map so I don't hate myself throwing arrays around
      const retMap: Map<string, number> = new Map();
      top5.forEach((pair) => {
        retMap.set(pair[0], pair[1]);
      });

      return retMap;
    }

    public static topFiveCountiesByTotalDeathsPerCapita(dhsData: DHSData, popData: WICensusData): Map<string, number> {
      const countyToCapitaMap: Map<string, number> = new Map();

      dhsData.features.forEach((dhsCounty) => {
        const countyName = dhsCounty.attributes.NAME;
        const population = popData[countyName];
        const perCapita = dhsCounty.attributes.DEATHS / population;
        const casesPer100k = perCapita * 100000;

        countyToCapitaMap.set(`${countyName}`, casesPer100k);
      });

      // convert to
      // [
      //   [ countyName, casesPer100k ],
      //   [ countyName, casesPer100k ]
      // ]
      // then sort descending on cases
      const sortArray = Array.from(countyToCapitaMap);
      sortArray.sort((a, b) => b[1] - a[1]);

      // Take the top 5
      const top5 = sortArray.slice(0, 5);

      // Convert back into a Map so I don't hate myself throwing arrays around
      const retMap: Map<string, number> = new Map();
      top5.forEach((pair) => {
        retMap.set(pair[0], pair[1]);
      });

      return retMap;
    }
}
