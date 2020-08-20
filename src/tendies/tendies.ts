
import got from 'got';
import { Daily } from './tendies-types';

export class Tendies {
    private static readonly TENDIES_TICKER: string = 'https://api.tiingo.com/tiingo';
    private static readonly TENDIES_TOKEN: string = 'ccaf7a0f08b609ab423174d74f70dbd7405b7fa5';

    /**
     * Calculate the percentage change in a stock price.
     * @param open The opening stock price.
     * @param close The closing stock price.
     * @param splitFactor The split factor.
     */
    public static calculateDailyPercentage(daily: Daily): number {
        return ((daily.adjClose - daily.adjOpen) / daily.adjOpen) * 100;
    }

    /**
     * Get the most recent price details of a ticker symbol.
     * @param ticker The ticker symbol.
     */
    public static async daily(ticker: string): Promise<Daily> {
        return got(`${Tendies.TENDIES_TICKER}/daily/${ticker}/prices?token=${Tendies.TENDIES_TOKEN}`, {responseType: 'json'}).then((response) => (response.body as Daily[])[0]);
    }

    /**
     * Calculate Blake's happiness.
     */
    public static async blakesHappiness(): Promise<string> {
        return Tendies.daily('ROK').then((daily) => {
            const percentChange = Tendies.calculateDailyPercentage(daily);

            if (percentChange > 0) {
                return `ROK closed up (+${percentChange.toFixed(1)}% :chart_with_upwards_trend:) today, Blake thanks you for his profit off your labor.`;
            } else if (percentChange < 0) {
                return `ROK closed down (${percentChange.toFixed(1)}% :chart_with_downwards_trend:) today, please thank Blake for his generosity if you still have a job.`;
            } else {
                return `ROK closed EVEN today, Blake is disappointed by your simulaneous lack of both gumption and ineptitude.`
            }
        })
    }

    public static async currentTendies(ticker: string): Promise<string> {
        return Tendies.daily(ticker).then((daily) => {
            const percentChange = Tendies.calculateDailyPercentage(daily);

            if (percentChange >= -1 && percentChange < 1) {
                return 'https://tenor.com/view/cmon-do-something-original-cmon-something-original-poke-gif-16424397';
            } else if (percentChange >= 1 && percentChange < 5) {
                return 'https://tenor.com/view/stonks-up-stongs-meme-stocks-gif-15715298';
            } else if (percentChange >= 5 && percentChange < 10) {
                return 'https://tenor.com/view/wsb-wall-street-bets-hands-up-cool-shades-gif-16964384';
            } else if (percentChange >= 10 ) {
                return 'https://tenor.com/view/jpow-jerome-powell-money-printing-covid-bailout-bailout-gif-16865595';
            } else if (percentChange >= -5 && percentChange < -1) {
                return 'https://tenor.com/view/not-stonks-profit-down-sad-frown-arms-crossed-gif-15684535';
            } else if (percentChange >= -10 && percentChange < -5) {
                return 'https://gfycat.com/classicmadhornedtoad';
            } else if (percentChange < -10 ) {
                return 'https://tenor.com/view/elmo-gif-9112913';
            } else {
                return 'https://tenor.com/view/what-the-fuck-wtf-blink182-gif-4982401';
            }
        });
    }
}