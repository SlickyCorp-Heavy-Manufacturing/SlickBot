import got from 'got';

export class Weather {
  private static readonly MKE_FORECAST: string = 'https://api.weather.gov/zones/land/WIZ066/forecast';

  public static async currentWeather(): Promise<string> {
    const response = await got(Weather.MKE_FORECAST, { responseType: 'json' });
    const forcast = (response.body as any).properties.periods[0];
    return `${forcast.name} ${forcast.detailedForecast}`;
  }
}
