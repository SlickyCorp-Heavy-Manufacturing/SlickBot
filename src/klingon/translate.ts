import got from 'got';

export class Translate {
  // Ratelimiting
  // Our translation API is public. To maintain our service level we ratelimit the
  // number of API calls. For public API calls this is 60 API calls a day with
  // distribution of 5 calls an hour. For paid plans this limit is increased according
  // to the service level described in the plan.

  private static readonly FUN_TRANSLATIONS: string = 'https://api.funtranslations.com/translate/klingon.json';

  public static readonly DEFAULT_KLINGON_REPLY: string = 'Klingon translation:\n';

  public static async translateToKlingon(message: string): Promise<string> {
    const everythingButBangKlingon = message.substr('!klingon '.length);

    const response = got.post(Translate.FUN_TRANSLATIONS, {
      json: {
        text: everythingButBangKlingon,
      },
      timeout: 10000,
      responseType: 'json',
    });

    try {
      await response;
      const translation = Translate.DEFAULT_KLINGON_REPLY + Translate.parseResults(response);
      return translation;
    } catch (e) {
      switch (e.constructor) {
        case got.ReadError:
          return 'Read Error';
        case got.HTTPError:
          return `HTTP Error ${e.response.statusCode}: ${e.response.statusMessage}`;
        case got.MaxRedirectsError:
          return `Max Redirects Error ${e.response.statusCode}: ${e.response.statusMessage}, URL: ${e.response.redirectUrls}`;
        case got.UnsupportedProtocolError:
          return 'Unsupported Protocol Error';
        case got.TimeoutError:
          return 'Request timed out; waited more than 10s';
        default:
          throw e;
      }
    }
  }

  private static parseResults(response: any): string {
    if (!response.body) {
      throw new Error('!klingon: parseResults: The response did not error but did not have a .body object. Did the API change?');
    } else if (!response.body.contents) {
      throw new Error('!klingon: parseResults: The response did not error but did not have a .body.contents object.');
    } else if (!response.body.contents.translated) {
      throw new Error('!klingon: parseResults: The response did not error but did not have a .body.contents.translated object.');
    } else {
      return response.body.contents.translated;
    }
  }
}
