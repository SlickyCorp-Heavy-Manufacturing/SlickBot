
/* eslint-disable @typescript-eslint/no-implied-eval */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { BotGuardClient } from 'bgutils-js/botguard';
import type { WebPoSignalOutput } from 'bgutils-js/shared-types';
import { createColdStartToken } from 'bgutils-js/webpo';
import { WebPoMinter } from 'bgutils-js/webpo';
import { buildURL, getHeaders, parseLooseJSON, USER_AGENT } from 'bgutils-js/utils';
import { JSDOM } from 'jsdom';
import type { IRawResponse } from 'youtubei.js';

interface BgChallengeResult {
  interpreterJavascript?: {
    privateDoNotAccessOrElseSafeScriptWrappedValue?: unknown;
  };
  program?: unknown;
  globalName?: unknown;
}

interface WebPoTokenResult {
  visitorData: string;
  placeholderPoToken: string;
  poToken: string;
}

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

  const dom = new JSDOM('<!DOCTYPE html><html lang="en"><head><title></title></head><body></body></html>', {
    url: 'https://www.youtube.com',
    referrer: 'https://www.youtube.com/'
  });

  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    location: dom.window.location,
    origin: dom.window.origin
  });

  if (!('navigator' in globalThis)) {
    Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator });
  }

  const pageResponse = await fetch('https://www.youtube.com', {
    headers: {
      accept: '*/*',
      'accept-language': 'en-US,en;q=0.7',
      'user-agent': USER_AGENT
    }
  });
  if (!pageResponse.ok) {
    throw new Error(`Unable to fetch YouTube homepage: ${pageResponse.status}`);
  }

  const pageHtml = await pageResponse.text();
  const initialAttestationData = /window\.ytAtN\(\s*({[\s\S]*?})\s*\)/.exec(pageHtml);
  if (!initialAttestationData) {
    throw new Error('Could not find BotGuard challenge');
  }

  const initialAttestationDataJson = parseLooseJSON(initialAttestationData[1]);
  const challengeResponse = initialAttestationDataJson.R as IRawResponse;
  const bgChallenge = challengeResponse.bgChallenge as BgChallengeResult | undefined;
  if (!bgChallenge) {
    throw new Error('Could not get BotGuard challenge');
  }

  const interpreterUrl = ensureString(
    (bgChallenge as { interpreterUrl?: { privateDoNotAccessOrElseTrustedResourceUrlWrappedValue?: unknown } })
      .interpreterUrl?.privateDoNotAccessOrElseTrustedResourceUrlWrappedValue,
    'interpreterUrl'
  );
  const bgScriptResponse = await fetch(`https:${interpreterUrl}`);
  const interpreterScript = await bgScriptResponse.text();
  if (!interpreterScript) {
    throw new Error('Could not load BotGuard interpreter');
  }

  new Function(interpreterScript)();

  const webPoSignalOutput: WebPoSignalOutput = [];
  const botGuardClient = await BotGuardClient.create({
    program: ensureString(bgChallenge.program, 'program'),
    globalName: ensureString(bgChallenge.globalName, 'globalName'),
    globalObject: globalThis
  });
  const botguardResponse = await botGuardClient.snapshot({ webPoSignalOutput });
  const integrityTokenResponse = await fetch(buildURL('GenerateIT', true), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify([requestKey, botguardResponse])
  });

  if (!integrityTokenResponse.ok) {
    throw new Error(`Unable to generate integrity token: ${integrityTokenResponse.status}`);
  }

  const integrityTokenData = await integrityTokenResponse.json() as [string, number, number, string];
  const webPoMinter = await WebPoMinter.create({
    integrityToken: integrityTokenData[0],
    estimatedTtlSecs: integrityTokenData[1],
    mintRefreshThreshold: integrityTokenData[2],
    websafeFallbackToken: integrityTokenData[3]
  }, webPoSignalOutput);
  const poToken = ensureString(await webPoMinter.mintAsWebsafeString(contentBinding), 'poToken');
  const placeholderPoToken = ensureString(createColdStartToken(contentBinding), 'placeholderPoToken');

  return {
    visitorData: contentBinding,
    placeholderPoToken,
    poToken,
  };
}
