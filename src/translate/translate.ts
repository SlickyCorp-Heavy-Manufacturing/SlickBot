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
      const everything_but_bangklingon = message.substr("!klingon ".length);
      const response = await got.post(Translate.FUN_TRANSLATIONS, {
        json: {
          text: everything_but_bangklingon,
        },
        responseType: 'json',
      });
        // console.log(response);
      const translation = (response.body as any).contents.translated;
      return translation;
    }
}
