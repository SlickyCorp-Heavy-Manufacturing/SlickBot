 
/* eslint-disable @typescript-eslint/no-implied-eval */
 
/* eslint-disable @typescript-eslint/no-unsafe-call */
 
import { BG, type BgConfig } from 'bgutils-js';
import { JSDOM } from 'jsdom';

export async function generateWebPoToken(contentBinding: string) {
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

  const bgChallenge = await BG.Challenge.create(bgConfig);

  if (!bgChallenge)
    throw new Error('Could not get challenge');

  const interpreterJavascript = bgChallenge.interpreterJavascript.privateDoNotAccessOrElseSafeScriptWrappedValue;

  if (interpreterJavascript) {
    new Function(interpreterJavascript)();
  } else throw new Error('Could not load VM');

  const poTokenResult = await BG.PoToken.generate({
    program: bgChallenge.program,
    globalName: bgChallenge.globalName,
    bgConfig
  });

  const placeholderPoToken = BG.PoToken.generateColdStartToken(contentBinding);

  return {
    visitorData: contentBinding,
    placeholderPoToken,
    poToken: poTokenResult.poToken,
  };
}
