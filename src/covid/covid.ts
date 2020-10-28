import got from 'got';
import { DateTime } from 'luxon';
import { IncomingMessage } from 'http';
import { UsDaily } from './covid-types';
import * as wiPopulationData from './wi_county_pop_data_2019.json';

export class Covid {
    private static readonly COVID_API: string = 'https://api.covidtracking.com/v1';

    public static async usDaily(): Promise<string> {
      return got(`${Covid.COVID_API}/us/current.json`, { responseType: 'json' }).then((response) => {
        const usDaily = response.body as UsDaily[];
        return `${usDaily[0].deathIncrease} Americans laid down their lives for Mike's tendies today.`;
      });
    }

    public static async wiDaily(): Promise<string> {
      const YESTERDAY_IN_MS = 1603231200000;
      const TODAY_IN_MS = 1603317600000;

      // const WI_CASE_RESULTS = got(`${Covid.WI_COVID_API}`);

      const retString = `
      ${Covid.newWiCases()} Wisconsinites tested positive today for a total of ${Covid.totalWiCases()}.\n
      Top five counties, new cases per capita:\n
      ${Covid.countiesToMd(Covid.topFiveCountiesByNewCasesPerCapita())}\n
      \n
      ${Covid.newWiDeaths()} Wisconsinites died today for a total of ${Covid.totalWiDeaths()}.\n
      Top five counties, new deaths per capita:\n
      ${Covid.countiesToMd(Covid.topFiveCountiesByNewDeathsPerCapita())}`;

      return got(`${Covid.COVID_API}/us/current.json`, { responseType: 'json' }).then((response) => {
        const usDaily = response.body as UsDaily[];
        return `${usDaily[0].deathIncrease} Americans laid down their lives for Mike's tendies today.`;
      });
    }

    // From https://data.dhsgis.wi.gov/datasets/covid-19-historical-data-by-county/geoservice?orderBy=GEOID
    static WI_COVID_API_SERVER = 'https://dhsgis.wi.gov';
    
    static WI_COVID_API_URL = '/server/rest/services/DHS_COVID19/COVID19_WI/MapServer/12/query';

    static WI_COVID_API_WHERE_DATE = '?where=DATE BETWEEN ';

    static WI_COVID_API_FIELDS = '&outFields=NAME,DATE,POSITIVE,POS_NEW,NEGATIVE,NEG_NEW,DEATHS,DTH_NEW,TEST_NEW,GEO'
    
    static WI_COVID_API_OUTSR = '&outSR=4326';

    static WI_COVID_API_TYPE = '&f=json';

    private static countiesToMd(counties: Object): string {
      return '';
    }

    public static datesToURI(startDate: DateTime, endDate: DateTime): string {
      const strStartDate = '\'' + startDate.toISO() + '\'';
      const strEndDate = '\'' + endDate.toISO() + '\'';
      const retString = strStartDate + ' AND ' + strEndDate;

      return retString;
    }

    public static fullDHSUri(startDate: DateTime, endDate: DateTime): string {
      const fullUri =
      Covid.WI_COVID_API_SERVER +
      Covid.WI_COVID_API_URL +
      Covid.WI_COVID_API_WHERE_DATE +
      Covid.datesToURI(startDate, endDate) +
      // extra space needed per DHS spec
      ' ' +
      Covid.WI_COVID_API_FIELDS +
      Covid.WI_COVID_API_OUTSR +
      Covid.WI_COVID_API_TYPE;

      const encoded = encodeURI(fullUri);
      
      // Encoding doesn't string escape single quotes, so handle those manually.
      const fixedUri = encoded.replace(/\'/g, "%27")
      return fixedUri;
    }

    public static async getDHSData(startDate: DateTime, endDate: DateTime) {
      // Because the DHS URL format does not follow std. query parameters, you cannot pass query parameters like normal.
      // Must pass the entire URI as one string. See https://github.com/sindresorhus/got/issues/1509
      const results = await got(this.fullDHSUri(startDate, endDate));

      // This is a Got() Reponse, which must be handled by the caller.
      // I could not find a way to validate that with Typescript types.
      return results;
    }

    private static newWiCases(): Number {
      return 1;
    }

    private static newWiDeaths(): Number {
      return 1;
    }

    private static totalWiCases(): Number {
      return 1;
    }

    private static totalWiDeaths(): Number {
      return 1;
    }

    private static topFiveCountiesByNewCasesPerCapita(): Object {
      return {};
    }

    private static topFiveCountiesByNewDeathsPerCapita(): Object {
      return {};
    }

    private static topFiveCountiesByNewTestPositivityPct(): Object {
      return {};
    }
}
