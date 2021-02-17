import got, { Response } from 'got';

import {
  CompanyProfile2,
  CryptoCandles,
  Quote,
  ShortInterest,
  Stock,
} from './tendies-types';

export class Tendies {
  private static readonly FINNHUB_URL: string = 'https://finnhub.io/api/v1';

  private static readonly FINNHUB_TOKEN: string = process.env.FINNHUB_TOKEN;

  /**
   * Calculate the percentage change in a stock price.
   * @param quote The stock quote
   */
  public static calculateQuotePercentage(quote: Quote): number {
    // (current - previousClose) / previousClose * 100
    return quote.pc === 0 ? 0.0 : ((quote.c - quote.pc) / quote.pc) * 100;
  }

  /**
   * Get the most recent price details of a ticker symbol.
   * @param symbol The ticker symbol.
   */
  public static async quote(symbol: string): Promise<Quote> {
    const response = await got(
      `${Tendies.FINNHUB_URL}/quote`,
      {
        responseType: 'json',
        searchParams: {
          symbol,
          token: Tendies.FINNHUB_TOKEN,
        },
      },
    );
    if (Object.entries(response.body).length === 0) {
      // Returns empty object when ticker symbol not found.
      throw new Error(`Ticker symbol '${symbol}' was not found.`);
    }
    if (response.statusCode !== 200) {
      throw new Error(`\`\`\`json\n${response.body}\n\`\`\``);
    }

    return response.body as Quote;
  }

  /**
   * Calculate Blake's happiness.
   */
  public static async blakesHappiness(): Promise<string> {
    const quote = await Tendies.quote('ROK');
    const percentChange = Tendies.calculateQuotePercentage(quote);

    if (percentChange > 0) {
      return `ROK closed up (+${percentChange.toFixed(2)}% :chart_with_upwards_trend:) today, Blake thanks you for his profit off your labor.`;
    } if (percentChange < 0) {
      return `ROK closed down (${percentChange.toFixed(2)}% :chart_with_downwards_trend:) today, please thank Blake for his generosity if you still have a job.`;
    }
    return 'ROK closed EVEN today, Blake is disappointed by your simulaneous lack of both gumption and ineptitude.';
  }

  /**
   * Return a message with information about the exchange rate of a crypto currency
   * @param symbol The symbol of the crypto currency
   */
  public static async crypto(symbol: string): Promise<string> {
    const now: number = Math.round(Date.now() / 1000);

    // Let's just assume binance exchange for now.
    let candles: CryptoCandles;
    try {
      const response = await got(
        `${Tendies.FINNHUB_URL}/crypto/candle`,
        {
          responseType: 'json',
          searchParams: {
            format: 'json',
            from: now - 86400,
            resolution: 'D',
            symbol: `BINANCE:${symbol.toUpperCase()}BUSD`,
            to: now,
            token: Tendies.FINNHUB_TOKEN,
          },
        },
      );
      if (response.statusCode === 200) {
        candles = response.body as CryptoCandles;
      } else {
        return `\`\`\`json\n${response.body}\n\`\`\``;
      }
    } catch (error) {
      return `Error: ${error.message}`;
    }

    if (candles.s && candles.s === 'ok') {
      let message = '';
      message += `**Current:** ${candles.c[0].toLocaleString('en-US', { style: 'currency', currency: 'USD' })}\n`;
      message += `**Low (24 hrs):** ${candles.l[0].toLocaleString('en-US', { style: 'currency', currency: 'USD' })}\n`;
      message += `**High (24 hrs):** ${candles.h[0].toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`;
      return message;
    }

    return 'Error: no data';
  }

  /**
   * Get the current stock price change and a humerous gif.
   * @param symbol The ticker symbol.
   */
  public static async tendies(symbol?: string): Promise<string> {
    // Grab a random US stock if none given
    let symbolValue = symbol;
    if (!symbolValue) {
      symbolValue = await Tendies.randomStock('US');
    }
    symbolValue = symbolValue.toUpperCase();

    // Get the quote
    let quote;
    try {
      quote = await Tendies.quote(symbolValue);
    } catch (error) {
      return (error.message ? error.message : `Unknown error fetching quote for '${symbolValue}`);
    }
    const priceChange = quote.c - quote.pc;
    const percentChange = Tendies.calculateQuotePercentage(quote);

    // Detailed message
    let details: string;
    if (percentChange > 0) {
      details = `**${symbolValue}:** +${priceChange.toFixed(2)} (${percentChange.toFixed(2)}%) :chart_with_upwards_trend:\n`;
    } else {
      details = `**${symbolValue}:** -${Math.abs(priceChange).toFixed(2)} (${Math.abs(percentChange).toFixed(2)}%) :chart_with_downwards_trend:\n`;
    }

    // Humerous gif
    if (percentChange >= -1 && percentChange < 1) {
      return `${details}https://tenor.com/view/cmon-do-something-original-cmon-something-original-poke-gif-16424397`;
    } if (percentChange >= 1 && percentChange < 5) {
      return `${details}https://tenor.com/view/stonks-up-stongs-meme-stocks-gif-15715298`;
    } if (percentChange >= 5 && percentChange < 10) {
      return `${details}https://tenor.com/view/wsb-wall-street-bets-hands-up-cool-shades-gif-16964384`;
    } if (percentChange >= 10 && percentChange < 15) {
      return `${details}https://tenor.com/view/jpow-jerome-powell-money-printing-covid-bailout-bailout-gif-16865595`;
    } if (percentChange >= 15) {
      return `${details}https://tenor.com/view/scrooge-mcduck-money-gif-13447299`;
    } if (percentChange >= -5 && percentChange < -1) {
      return `${details}https://tenor.com/view/not-stonks-profit-down-sad-frown-arms-crossed-gif-15684535`;
    } if (percentChange >= -10 && percentChange < -5) {
      return `${details}https://cdn.discordapp.com/attachments/679842740124647540/805163871404032030/B5wb1K8.png`;
    } if (percentChange >= -15 && percentChange < -10) {
      return `${details}https://tenor.com/view/elmo-gif-9112913`;
    } if (percentChange < -15) {
      return `${details}https://tenor.com/view/market-simpsons-poor-stonks-notsure500-gif-16072046`;
    }
    return `${details}https://tenor.com/view/what-the-fuck-wtf-blink182-gif-4982401`;
  }

  /**
   * Get a random stock from an exchange.
   * @see https://finnhub.io/docs/api#stock-symbols
   * @param exchange An exchange ID
   */
  public static async randomStock(exchange: string): Promise<string> {
    const response = await got(
      `${Tendies.FINNHUB_URL}/stock/symbol`,
      {
        responseType: 'json',
        searchParams: {
          exchange,
          token: Tendies.FINNHUB_TOKEN,
        },
      },
    );
    if ((response.body as any[]).length === 0) {
      // Returns empty object when ticker symbol not found.
      throw new Error(`Stock Exchange '${exchange}' was not found.`);
    }

    const stocks = response.body as Stock[];
    const randIndex = Math.round(Math.random() * stocks.length);
    return stocks[randIndex > (stocks.length - 1) ? stocks.length - 1 : randIndex].symbol;
  }

  public static async shorts(symbol: string): Promise<string> {
    // Get Short Interest
    const shortInterest = await got(
      `${Tendies.FINNHUB_URL}/stock/short-interest`,
      {
        responseType: 'json',
        searchParams: {
          symbol: symbol.toUpperCase(),
          token: Tendies.FINNHUB_TOKEN,
        },
      },
    ).then((response: Response<any>) => response.body as ShortInterest);
    if (shortInterest.data.length === 0) {
      // Returns empty object when ticker symbol not found.
      throw new Error(`Symbol '${symbol}' was not found.`);
    }

    // Get outstanding shares
    const companyProfile2 = await got(
      `${Tendies.FINNHUB_URL}/stock/profile2`,
      {
        responseType: 'json',
        searchParams: {
          symbol: symbol.toUpperCase(),
          token: Tendies.FINNHUB_TOKEN,
        },
      },
    ).then((response: Response<any>) => response.body as CompanyProfile2);

    const sharesOutstanding = companyProfile2.shareOutstanding * 1000000;
    const shortPercent = (shortInterest.data[0].shortInterest / sharesOutstanding) * 100;
    return `${symbol.toUpperCase()} Short Interest: ${(shortPercent).toFixed(2)}%`;
  }
}
