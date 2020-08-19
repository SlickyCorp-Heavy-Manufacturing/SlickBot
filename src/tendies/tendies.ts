
import got from 'got';

export class Tendies {
    private static readonly TENDIES_TICKER: string =  'https://api.tiingo.com/tiingo/daily/';

    public static async currentTendies(ticker: string): Promise<string> {
        var datetime = new Date();
        const currentDate = datetime.toISOString().substring(0,datetime.toISOString().indexOf('T'));
        const response = await got(Tendies.TENDIES_TICKER + ticker + '/prices?startDate=' + currentDate + '&token=ccaf7a0f08b609ab423174d74f70dbd7405b7fa5', {responseType: 'json'})
        const open = (response.body as any)[0].open;
        const close = (response.body as any)[0].close;
        const percentChange = (close - open)/open * 100;

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
    }
}