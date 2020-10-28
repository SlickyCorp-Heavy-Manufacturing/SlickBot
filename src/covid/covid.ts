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
    static WI_COVID_API_URL = 'https://dhsgis.wi.gov/server/rest/services/DHS_COVID19/COVID19_WI/MapServer/12/query';
    static WI_COVID_API_WHERE_DATE = 'where=DATE BETWEEN ';
    static WI_COVID_API_FIELDS = '&outFields=NAME,DATE,POSITIVE,POS_NEW,NEGATIVE,NEG_NEW,DEATHS,DTH_NEW,TEST_NEW,GEO&outSR=4326';
    static WI_COVID_API_TYPE = '&f=json';

    private static countiesToMd(counties: Object): string {
      return '';
    }

    public static async getDHSData(startDate: DateTime, endDate: DateTime): Promise<Object> {
      const dateString = `DATE BETWEEN ${startDate} AND ${endDate}`;
      const outFieldsString = 'NAME,DATE,POSITIVE,POS_NEW,NEGATIVE,NEG_NEW,DEATHS,DTH_NEW,TEST_NEW,GEO';
      const outSRString = '4326';
      const apiTypeString = 'json'
      
      const results = await got(
        this.WI_COVID_API_URL, 
        {
          searchParams:
          {
            where: dateString,
            outFields: outFieldsString,
            outSR: outSRString,
            f: apiTypeString
          }
        }
      );
      
      return results.body;
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
