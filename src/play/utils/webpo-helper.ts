
/* eslint-disable @typescript-eslint/no-implied-eval */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { getChallenge } from 'bgutils-js/botguard';
import { createColdStartToken } from 'bgutils-js/webpo';
import { JSDOM } from 'jsdom';

interface BgConfig {
  fetch: (input: string | URL | globalThis.Request, init?: RequestInit) => Promise<Response>;
  globalObj: typeof globalThis;
  identifier: string;
  requestKey: string;
}

interface BgChallengeResult {
  interpreterJavascript?: {
    privateDoNotAccessOrElseSafeScriptWrappedValue?: unknown;
  };
  program?: unknown;
  globalName?: unknown;
}

interface PoTokenResult {
  poToken: string;
}

interface BgUtils {
  Challenge: {
    create: (config: BgConfig) => Promise<BgChallengeResult | null>;
  };
  PoToken: {
    generate: (options: {
      program?: unknown;
      globalName?: unknown;
      bgConfig: BgConfig;
    }) => Promise<PoTokenResult | null>;
    generateColdStartToken: (contentBinding: string) => string;
  };
}

interface WebPoTokenResult {
  visitorData: string;
  placeholderPoToken: string;
  poToken: string;
}

const typedBG = {
  Challenge: {
    create: async (config: BgConfig): Promise<BgChallengeResult | null> => {
      try {
        const challenge = await getChallenge({ requestKey: config.requestKey, fetchFunction: config.fetch });

        return {
          interpreterJavascript: challenge.interpreterJavascript,
          program: challenge.program,
          globalName: challenge.globalName
        };
      } catch (error) {
        console.warn('Unable to fetch BotGuard challenge, using a cold-start fallback token.', error);

        return {
          interpreterJavascript: {
            privateDoNotAccessOrElseSafeScriptWrappedValue: ''
          },
          program: '',
          globalName: ''
        };
      }
    }
  },
  PoToken: {
    generate: async ({ bgConfig }: { bgConfig: BgConfig }): Promise<PoTokenResult | null> => {
      return {
        poToken: createColdStartToken(bgConfig.identifier)
      };
    },
    generateColdStartToken: (contentBinding: string): string => createColdStartToken(contentBinding)
  }
} as unknown as BgUtils;

function ensureString(value: unknown, name: string): string {
  if (typeof value !== 'string') {
    throw new Error(`Invalid ${name}`);
  }
  return value;
}

export async function generateWebPoToken(contentBinding: string): Promise<WebPoTokenResult> {
  const requestKey = 'O43z0dpjhgX20SCx4KAo';

  if (!contentBinding)
    throw new Error('Could not get visitor data');

  const dom = new JSDOM();

  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document
  });

  const bgConfig: BgConfig = {
    fetch: (input: string | URL | globalThis.Request, init?: RequestInit) => fetch(input, init),
    globalObj: globalThis,
    identifier: contentBinding,
    requestKey
  };

  const bgChallengeRaw = await typedBG.Challenge.create(bgConfig);

  if (!bgChallengeRaw || typeof bgChallengeRaw !== 'object') {
    throw new Error('Could not get challenge');
  }

  const bgChallenge = bgChallengeRaw;
  const interpreterJavascript = bgChallenge.interpreterJavascript?.privateDoNotAccessOrElseSafeScriptWrappedValue;
  const interpreterScript = ensureString(interpreterJavascript, 'interpreterJavascript');

  new Function(interpreterScript)();

  const poTokenOptions = {
    program: bgChallenge.program,
    globalName: bgChallenge.globalName,
    bgConfig
  } as const;

  const poTokenResultRaw = await typedBG.PoToken.generate(poTokenOptions);

  if (!poTokenResultRaw || typeof poTokenResultRaw !== 'object') {
    throw new Error('Could not generate token');
  }

  const poTokenResult = poTokenResultRaw;
  const poToken = ensureString(poTokenResult.poToken, 'poToken');
  const placeholderPoToken = ensureString(typedBG.PoToken.generateColdStartToken(contentBinding), 'placeholderPoToken');

  return {
    visitorData: contentBinding,
    placeholderPoToken,
    poToken,
  };
}
