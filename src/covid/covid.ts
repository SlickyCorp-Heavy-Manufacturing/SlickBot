import got from 'got';
import { UsDaily } from './covid-types';

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

      const WI_CASE_RESULTS = got(`${Covid.WI_COVID_API}`);

      const retString = `
      ${Covid.newWiCases()} Wisconsinites tested positive today for a total of ${Covid.totalWiCases()}.\n
      Top five counties, new cases per capita:\n
      ${Covid.countiesToMd(Covid.topFiveCountiesByNewCasesPerCapita())}\n
      \n
      ${Covid.newWiDeaths()} Wisconsinites died today for a total of ${Covid.totalWiDeaths()}.\n
      Top five counties, new deaths per capita:\n
      ${Covid.countiesToMd(Covid.topFiveCountiesByNewDeathsPerCapita())}`


      


      return got(`${Covid.COVID_API}/us/current.json`, { responseType: 'json' }).then((response) => {
        const usDaily = response.body as UsDaily[];
        return `${usDaily[0].deathIncrease} Americans laid down their lives for Mike's tendies today.`;
      });
    }

    // From https://data.dhsgis.wi.gov/datasets/covid-19-historical-data-by-county/geoservice?orderBy=GEOID
    static WI_COVID_API = `
      https://dhsgis.wi.gov/server/rest/services/DHS_COVID19/COVID19_WI/MapServer/12/query?
      where=DATE > '2020-10-19'
      &outFields=NAME,DATE,POSITIVE,POS_NEW,NEGATIVE,NEG_NEW,DEATHS,DTH_NEW,TEST_NEW,GEO&outSR=4326
      &f=json`

    // from https://www.census.gov/data/datasets/time-series/demo/popest/2010s-counties-total.html
    static WI_COUNTY_POP_2019_EST = {
      "Adams": 20220,
      "Ashland": 15562,
      "Barron": 45244,
      "Bayfield": 15036,
      "Brown": 264542,
      "Buffalo": 13031,
      "Burnett": 15414,
      "Calumet": 50089,
      "Chippewa": 64658,
      "Clark": 34774,
      "Columbia": 57532,
      "Crawford": 16131,
      "Dane": 546695,
      "Dodge": 87839,
      "Door": 27668,
      "Douglas": 43150,
      "Dunn": 45368,
      "Eau Claire": 104646,
      "Florence": 4295,
      "Fond du Lac": 103403,
      "Forest": 9004,
      "Grant": 51439,
      "Green": 36960,
      "Green Lake": 18913,
      "Iowa": 23678,
      "Iron": 5687,
      "Jackson": 20643,
      "Jefferson": 84769,
      "Juneau": 26687,
      "Kenosha": 169561,
      "Kewaunee": 20434,
      "La Crosse": 118016,
      "Lafayette": 16665,
      "Langlade": 19189,
      "Lincoln": 27593,
      "Manitowoc": 78987,
      "Marathon": 135692,
      "Marinette": 40350,
      "Marquette": 15574,
      "Menominee": 4556,
      "Milwaukee": 945726,
      "Monroe": 46253,
      "Oconto": 37930,
      "Oneida": 35595,
      "Outagamie": 187885,
      "Ozaukee": 89221,
      "Pepin": 7287,
      "Pierce": 42754,
      "Polk": 43783,
      "Portage": 70772,
      "Price": 42754,
      "Racine": 196311,
      "Richland": 17252,
      "Rock": 163354,
      "Rusk": 14178,
      "St. Croix": 90687,
      "Sauk": 64442,
      "Sawyer": 16558,
      "Shawano": 40899,
      "Sheboygan": 115340,
      "Taylor": 20343,
      "Trempealeau": 29649,
      "Vernon": 30822,
      "Vilas": 20195,
      "Walworth": 103868,
      "Washburn": 15720,
      "Washington": 136034,
      "Waukesha": 404198,
      "Waupaca": 50990,
      "Waushara": 24443,
      "Winnebago": 171907,
      "Wood": 72999,
    }

    private static countiesToMd(counties: Object): string {
      return "";
    }

    public static async getDHSData(): Promise<Object> {
      return {};
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
