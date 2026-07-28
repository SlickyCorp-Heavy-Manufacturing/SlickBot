declare module 'bgutils-js' {
  export interface BgConfig {
    fetch: (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
    globalObj: typeof globalThis;
    identifier: string;
    requestKey: string;
  }

  export interface BgChallengeResult {
    interpreterJavascript?: {
      privateDoNotAccessOrElseSafeScriptWrappedValue?: unknown;
    };
    program?: unknown;
    globalName?: unknown;
  }

  export interface PoTokenResult {
    poToken: string;
  }

  export interface BgUtils {
    Challenge: {
      create(config: BgConfig): Promise<BgChallengeResult | null>;
    };
    PoToken: {
      generate(options: {
        program?: unknown;
        globalName?: unknown;
        bgConfig: BgConfig;
      }): Promise<PoTokenResult | null>;
      generateColdStartToken(contentBinding: string): string;
    };
  }

  export const BG: BgUtils;
}
