
import got from 'got';

import { Quote, Stock } from './tendies-types';

export class Tendies {
    private static readonly FINNHUB_URL: string = 'https://finnhub.io/api/v1';
    private static readonly FINNHUB_TOKEN: string = process.env.FINNHUB_TOKEN;

    /**
     * Calculate the percentage change in a stock price.
     * @param quote The stock quote
     */
    public static calculateQuotePercentage(quote: Quote): number {
        // (current - previousClose) / previousClose * 100
        return (quote.c - quote.pc) / quote.pc * 100;
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
                    symbol: symbol,
                    token: Tendies.FINNHUB_TOKEN,
                }
            },
        );
        if (Object.entries(response.body).length === 0) {
            // Returns empty object when ticker symbol not found.
            throw new Error(`Ticker symbol '${symbol}' was not found.`);
        }

        return response.body as Quote;
    }

    /**
     * Calculate Blake's happiness.
     */
    public static async blakesHappiness(): Promise<string> {
        return Tendies.quote('ROK').then((quote) => {
            const percentChange = Tendies.calculateQuotePercentage(quote);

            if (percentChange > 0) {
                return `ROK closed up (+${percentChange.toFixed(2)}% :chart_with_upwards_trend:) today, Blake thanks you for his profit off your labor.`;
            } else if (percentChange < 0) {
                return `ROK closed down (${percentChange.toFixed(2)}% :chart_with_downwards_trend:) today, please thank Blake for his generosity if you still have a job.`;
            } else {
                return `ROK closed EVEN today, Blake is disappointed by your simulaneous lack of both gumption and ineptitude.`
            }
        });
    }

    /**
     * Get the current stock price change and a humerous gif.
     * @param symbol The ticker symbol.
     */
    public static async currentTendies(symbol?: string): Promise<string> {
        // Grab a random US stock if none given
        let symbolValue = symbol;
        if (!symbolValue) {
            symbolValue = await Tendies.randomStock('US');
        }

        // Get the quote
        let quote = await Tendies.quote(symbol);
        const priceChange = quote.c - quote.pc;
        const percentChange = Tendies.calculateQuotePercentage(quote);

        // Detailed message
        let details: string;
        if (percentChange > 0) {
            details = `**${symbol}:** +${priceChange.toFixed(2)} (${percentChange.toFixed(2)}%) :chart_with_upwards_trend:`;
        } else {
            details = `**${symbol}:** ${priceChange.toFixed(2)} (${Math.abs(percentChange).toFixed(2)}%) :chart_with_downwards_trend:`;
        }
        return Promise.resolve(details);

        // Humerous gif
        if (percentChange >= -1 && percentChange < 1) {
            return Promise.resolve(`${details}https://tenor.com/view/cmon-do-something-original-cmon-something-original-poke-gif-16424397`);
        } else if (percentChange >= 1 && percentChange < 5) {
            return Promise.resolve(`${details}https://tenor.com/view/stonks-up-stongs-meme-stocks-gif-15715298`);
        } else if (percentChange >= 5 && percentChange < 10) {
            return Promise.resolve(`${details}https://tenor.com/view/wsb-wall-street-bets-hands-up-cool-shades-gif-16964384`);
        } else if (percentChange >= 10) {
            return Promise.resolve(`${details}https://tenor.com/view/jpow-jerome-powell-money-printing-covid-bailout-bailout-gif-16865595`);
        } else if (percentChange >= -5 && percentChange < -1) {
            return Promise.resolve(`${details}https://tenor.com/view/not-stonks-profit-down-sad-frown-arms-crossed-gif-15684535`);
        } else if (percentChange >= -10 && percentChange < -5) {
            return Promise.resolve(`${details}https://gfycat.com/classicmadhornedtoad`);
        } else if (percentChange < -10) {
            return Promise.resolve(`${details}https://tenor.com/view/elmo-gif-9112913`);
        } else {
            return Promise.resolve(`${details}https://tenor.com/view/what-the-fuck-wtf-blink182-gif-4982401`);
        }
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
                    exchange: exchange,
                    token: Tendies.FINNHUB_TOKEN,
                }
            },
        );
        if ((response.body as any[]).length === 0) {
            // Returns empty object when ticker symbol not found.
            throw new Error(`Stock Exchange '${exchange}' was not found.`);
        }

        const stocks = response.body as Stock[];
        let randIndex = Math.round(Math.random() * stocks.length);
        return Promise.resolve(stocks[randIndex > (stocks.length - 1) ? stocks.length - 1 : randIndex].symbol);
    }
}
