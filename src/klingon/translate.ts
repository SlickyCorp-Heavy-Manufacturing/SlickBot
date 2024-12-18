import got, { HTTPError, MaxRedirectsError, ReadError, Response, TimeoutError } from 'got';

interface TranslateResponse {
  contents?: {
    translated?: string;
  };
}

export class Translate {
  // Ratelimiting
  // Our translation API is public. To maintain our service level we ratelimit the
  // number of API calls. For public API calls this is 60 API calls a day with
  // distribution of 5 calls an hour. For paid plans this limit is increased according
  // to the service level described in the plan.

  private static readonly FUN_TRANSLATIONS: string = 'https://api.funtranslations.com/translate/klingon.json';

  public static readonly DEFAULT_KLINGON_REPLY: string = 'Klingon translation:\n';

  public static async translateToKlingon(message: string): Promise<string> {
    const everythingButBangKlingon = message.replace(/^!klingon\s+/, '');

    try {
      const response = await got.post(
        Translate.FUN_TRANSLATIONS,
        {
          json: {
            text: everythingButBangKlingon,
          },
          timeout: {
            connect: 10000,
            response: 10000,
            secureConnect: 10000,
          },
          responseType: 'json',
        }
      );
      const translation = Translate.DEFAULT_KLINGON_REPLY + Translate.parseResults(response);
      return translation;
    } catch (e: unknown) {
      if (e instanceof ReadError) {
        return 'Read Error';
      }
      else if (e instanceof HTTPError) {
        return `HTTP Error ${e.response.statusCode}: ${e.response.statusMessage}`;
      }
      else if (e instanceof MaxRedirectsError) {
        return `Max Redirects Error ${e.response.statusCode}: ${e.response.statusMessage}, URL: ${JSON.stringify(e.response.redirectUrls)}`;
      }
      else if (e instanceof TimeoutError) {
        return 'Request timed out; waited more than 10s';
      } else {
        throw e;
      }
    }
  }

  private static parseResults(response: Response): string {
    if (!response.body) {
      throw new Error('!klingon: parseResults: The response did not error but did not have a .body object. Did the API change?');
    } else {
      const body = response.body as TranslateResponse;
      if (!body.contents) {
        throw new Error('!klingon: parseResults: The response did not error but did not have a .body.contents object.');
      } else if (!body.contents.translated) {
        throw new Error('!klingon: parseResults: The response did not error but did not have a .body.contents.translated object.');
      } else {
        return body.contents.translated;
      }
    }
  }
}
