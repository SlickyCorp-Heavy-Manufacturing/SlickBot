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
}
