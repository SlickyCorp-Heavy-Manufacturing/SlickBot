import got from 'got';

export interface FlavorForecast {
  date: string;
  flavors: Flavor[];
}

export interface Flavor {
  flavor: string;
  description: string;
  image: string;
}

export class KoppsFlavorForecast {
  // API that scraps kopps.com to determine the flavor forecast
  private static readonly KOPPS_FORECAST: string = 'https://kopps-flavor-forecast.tutkowski.com/';

  public static async flavorForecast(): Promise<FlavorForecast[]> {
    const response = await got(KoppsFlavorForecast.KOPPS_FORECAST, { responseType: 'json' });
    return response.body as FlavorForecast[];
  }

  public static async flavorOfTheDay(): Promise<FlavorForecast> {
    const flavorForecast = await this.flavorForecast();
    if (flavorForecast.length > 0) {
      return flavorForecast[0];
    }
    return Promise.reject(new Error('Flavor of the day not found'));
  }
}
