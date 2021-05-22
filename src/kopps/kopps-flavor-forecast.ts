import got from 'got';
import cheerio from 'cheerio';

export interface Flavor {
  flavor: string;
  description: string;
  image: string;
}

export interface FlavorForecast {
  date: string;
  flavors: Flavor[];
}

export class KoppsFlavorForecast {
  public static async flavorForecast(): Promise<FlavorForecast[]> {
    const flavorPreviewHtml = (await got('https://www.kopps.com/flavor-preview')).body;
    const flavorCardsHtmlElements = KoppsFlavorForecast.getFlavorCardsHTML(flavorPreviewHtml);
    return flavorCardsHtmlElements.map((flavorCardsHtmlElement: string) => KoppsFlavorForecast.getFlavorForecastFromHTML(flavorCardsHtmlElement));
  }

  public static async flavorOfTheDay(): Promise<FlavorForecast> {
    const flavorForecast = await this.flavorForecast();
    if (flavorForecast.length > 0) {
      return flavorForecast[0];
    }
    return Promise.reject(new Error('Flavor of the day not found'));
  }

  public static getFlavorCardsHTML(flavorPreviewHtml: string): string[] {
    const $ = cheerio.load(flavorPreviewHtml);
    return $('.flavor-forecast').toArray().map(forecastCard => $.html(forecastCard));
  }
  
  private static getFlavorForecastFromHTML(flavorCardHtml: string): FlavorForecast {
    const $ = cheerio.load(flavorCardHtml);
  
    const flavors: Flavor[] = [];
    for (let i = 1; i<= 2; ++i) {
      const flavor = $(`.grid div:nth-of-type(${i}) .flavor-of-day`).text()?.trim();
      const description = $(`.grid div:nth-of-type(${i}) p`).text()?.trim();
      const image = 'https://www.kopps.com' + $(`.grid div:nth-of-type(${i}) .flavor-circle img`).prop('src');
      if (flavor && description && image) { 
        flavors.push({ flavor, description, image });
      }
    }
  
    return { date: $('h5').text(), flavors };
  }
}
