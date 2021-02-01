/**
 * A stock quote
 * @see https://finnhub.io/docs/api#quote
 */
export interface CompanyProfile2 {
  country: string;
  currency: string;
  exchange: string;
  ipo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
  logo: string;
  finnhubIndustry: string;
}

export interface Quote {
  c: number,
  h: number,
  l: number,
  o: number,
  pc: number,
  t: number,
}

export interface ShortInterest {
  data: {
    date: string;
    shortInterest: number;
  }[];
  symbol: string;
}

export interface Stock {
  currency: string,
  description: string,
  displaySymbol: string,
  symbol: string,
  type: string
}
