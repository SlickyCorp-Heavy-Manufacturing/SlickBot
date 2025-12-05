/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-implied-eval */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
 
/* eslint-disable @typescript-eslint/no-unsafe-call */
 
/* eslint-disable @typescript-eslint/no-misused-promises */
import type { ReloadPlaybackContext } from 'googlevideo/protos';
import { SabrStream, type SabrPlaybackOptions } from 'googlevideo/sabr-stream';
import type { SabrFormat } from 'googlevideo/shared-types';
import { buildSabrFormat } from 'googlevideo/utils';
import { createWriteStream, type WriteStream } from 'node:fs';
import { Constants, Innertube, type IPlayerResponse, Platform, UniversalCache, YTNodes } from 'youtubei.js';
import type { Types } from 'youtubei.js';

import { generateWebPoToken } from './webpo-helper';

export interface DownloadOutput {
  stream: WriteStream;
  filePath: string;
}

export interface StreamResults {
  videoStream: ReadableStream;
  audioStream: ReadableStream;
  selectedFormats: {
    videoFormat: SabrFormat;
    audioFormat: SabrFormat;
  };
  videoTitle: string;
}

Platform.shim.eval = async (data: Types.BuildScriptResult, env: Record<string, Types.VMPrimative>) => {
  const properties: string[] = [];

  if (env.n) {
    properties.push(`n: exportedVars.nFunction("${env.n}")`);
  }

  if (env.sig) {
    properties.push(`sig: exportedVars.sigFunction("${env.sig}")`);
  }

  const code = `${data.output}\nreturn { ${properties.join(', ')} }`;

  return new Function(code)();
};

/**
 * Fetches video details and streaming information from YouTube.
 */
export async function makePlayerRequest(innertube: Innertube, videoId: string, reloadPlaybackContext?: ReloadPlaybackContext): Promise<IPlayerResponse> {
  const watchEndpoint = new YTNodes.NavigationEndpoint({ watchEndpoint: { videoId } });

  const extraArgs: Record<string, any> = {
    playbackContext: {
      adPlaybackContext: { pyv: true },
      contentPlaybackContext: {
        vis: 0,
        splay: false,
        lactMilliseconds: '-1',
        signatureTimestamp: innertube.session.player?.signature_timestamp
      }
    },
    contentCheckOk: true,
    racyCheckOk: true
  };

  if (reloadPlaybackContext) {
    extraArgs.playbackContext.reloadPlaybackContext = reloadPlaybackContext;
  }

  return await watchEndpoint.call<IPlayerResponse>(innertube.actions, { ...extraArgs, parse: true });
}

export function determineFileExtension(mimeType: string): string {
  if (mimeType.includes('video')) {
    return mimeType.includes('webm') ? 'webm' : 'mp4';
  } else if (mimeType.includes('audio')) {
    return mimeType.includes('webm') ? 'webm' : 'm4a';
  }
  return 'bin';
}

export function createOutputStream(title: string, mimeType: string): DownloadOutput {
  const type = mimeType.includes('video') ? 'video' : 'audio';
  const sanitizedTitle = title?.replace(/[^a-z0-9]/gi, '_') || 'unknown';
  const extension = determineFileExtension(mimeType);
  const fileName = `${sanitizedTitle}.${type}.${extension}`;

  return {
    stream: createWriteStream(fileName, { flags: 'w', encoding: 'binary' }),
    filePath: fileName
  };
}

export function bytesToMB(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(2);
}

/**
 * Initializes Innertube client and sets up SABR streaming for a YouTube video.
 */
export async function createSabrStream(
  videoId: string,
  options: SabrPlaybackOptions
): Promise<{
  innertube: Innertube;
  streamResults: StreamResults;
}> {
  const innertube = await Innertube.create({ cache: new UniversalCache(true) });
  const webPoTokenResult = await generateWebPoToken(videoId);

  // Get video metadata.
  const playerResponse = await makePlayerRequest(innertube, videoId);
  const videoTitle = playerResponse.video_details?.title || 'Unknown Video';

  console.info(`
    Title: ${videoTitle}
    Duration: ${playerResponse.video_details?.duration}
    Views: ${playerResponse.video_details?.view_count}
    Author: ${playerResponse.video_details?.author}
    Video ID: ${playerResponse.video_details?.id}
  `);

  // Now get the streaming information.
  const serverAbrStreamingUrl = await innertube.session.player?.decipher(playerResponse.streaming_data?.server_abr_streaming_url);
  const videoPlaybackUstreamerConfig = playerResponse.player_config?.media_common_config.media_ustreamer_request_config?.video_playback_ustreamer_config;

  if (!videoPlaybackUstreamerConfig) throw new Error('ustreamerConfig not found');
  if (!serverAbrStreamingUrl) throw new Error('serverAbrStreamingUrl not found');

  const sabrFormats = playerResponse.streaming_data?.adaptive_formats.map(buildSabrFormat) || [];

  const serverAbrStream = new SabrStream({
    formats: sabrFormats,
    serverAbrStreamingUrl,
    videoPlaybackUstreamerConfig,
    poToken: webPoTokenResult.poToken,
    clientInfo: {
      clientName: parseInt(Constants.CLIENT_NAME_IDS[innertube.session.context.client.clientName as keyof typeof Constants.CLIENT_NAME_IDS]),
      clientVersion: innertube.session.context.client.clientVersion
    }
  });

  // Handle player response reload events (e.g, when IP changes, or formats expire).
  serverAbrStream.on('reloadPlayerResponse', async (reloadPlaybackContext) => {
    const playerResponse = await makePlayerRequest(innertube, videoId, reloadPlaybackContext);

    const serverAbrStreamingUrl = await innertube.session.player?.decipher(playerResponse.streaming_data?.server_abr_streaming_url);
    const videoPlaybackUstreamerConfig = playerResponse.player_config?.media_common_config.media_ustreamer_request_config?.video_playback_ustreamer_config;

    if (serverAbrStreamingUrl && videoPlaybackUstreamerConfig) {
      serverAbrStream.setStreamingURL(serverAbrStreamingUrl);
      serverAbrStream.setUstreamerConfig(videoPlaybackUstreamerConfig);
    }
  });

  const { videoStream, audioStream, selectedFormats } = await serverAbrStream.start(options);

  return {
    innertube,
    streamResults: {
      videoStream,
      audioStream,
      selectedFormats,
      videoTitle
    }
  };
}
