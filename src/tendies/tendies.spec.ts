import { expect } from 'chai';
import 'mocha';
import nock from 'nock';

import { Tendies } from './tendies.js';
import { Quote, Stock } from './tendies-types.js';

describe('tendies', () => {
  const quote: Quote = {
    c: 226.83,
    h: 229,
    l: 226.03,
    o: 227.44,
    pc: 228.68,
    t: 1597969605,
  };
  const stocks: Stock[] = [
    {
      currency: 'USD',
      description: 'VIRGIN GALACTIC HOLDINGS INC',
      displaySymbol: 'SPCE',
      symbol: 'SPCE',
      type: 'EQS',
    },
    {
      currency: 'USD',
      description: 'TESLA INC',
      displaySymbol: 'TSLA',
      symbol: 'TSLA',
      type: 'EQS',
    },
  ];
  const zeroQuote: Quote = {
    c: 0.0,
    h: 0.0,
    l: 0.0,
    o: 0.0,
    pc: 0.0,
    t: 1597969605,
  };

  afterEach(() => {
    nock.cleanAll();
  });

  it('calculateQuotePercentage() calculates percentage', () => {
    expect(Tendies.calculateQuotePercentage(quote)).to.be.closeTo(-0.81, 2);
    expect(Tendies.calculateQuotePercentage(zeroQuote)).to.be.closeTo(0.0, 2);
  });

  it('quote() should get most recent stock numbers', async () => {
    nock('https://finnhub.io')
      .get('/api/v1/quote')
      .query((query) => query.symbol === 'foo') // only care about the symbol parameter
      .reply(200, quote);

    const fooQuote = await Tendies.quote('foo');
    expect(fooQuote.c).to.equal(226.83);
  });

  it('quote() should throw error when stock not found', async () => {
    nock('https://finnhub.io')
      .get('/api/v1/quote')
      .query((query) => query.symbol === 'foo')
      .reply(200, {});

    let error: unknown;
    try {
      await Tendies.quote('foo');
    } catch (err: unknown) {
      error = err;
    }

    expect(error).to.not.be.undefined;
  });

  it('quote() should throw error when non-200 response', async () => {
    nock('https://finnhub.io')
      .get('/api/v1/quote')
      .query((query) => query.symbol === 'foo')
      .reply(204, '{"error": "No Content"}');

    let error: unknown;
    try {
      await Tendies.quote('foo');
    } catch (err: unknown) {
      error = err;
    }

    expect(error).to.not.be.undefined;
    expect((error as Error).message).to.include('json');
  });

  it('randomStock() should get a random stock from the exchange', async () => {
    nock('https://finnhub.io')
      .get('/api/v1/stock/symbol')
      .query((query) => query.exchange === 'foo') // only care about the exchange parameter
      .reply(200, stocks);

    const fooStock = await Tendies.randomStock('foo');
    expect(fooStock).to.match(/SPCE|TSLA/);
  });

  it('tendies() should return GIF URL', async () => {
    nock('https://finnhub.io')
      .get('/api/v1/quote')
      .query((query) => query.symbol === 'FOO') // only care about the symbol parameter
      .reply(200, quote);

    const tendies = await Tendies.tendies('FOO');
    expect(tendies).to.include('https://tenor.com/view/cmon-do-something-original-cmon-something-original-poke-gif-16424397');
  });
});
