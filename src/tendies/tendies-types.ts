/**
 * A stock quote
 * @see https://finnhub.io/docs/api#quote
 */
export interface Quote {
    c: number,
    h: number,
    l: number,
    o: number,
    pc: number,
    t: number,
};

export interface Stock {
    currency: string,
    description: string,
    displaySymbol: string,
    symbol: string,
    type: string
};
