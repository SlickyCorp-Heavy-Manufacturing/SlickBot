import { promisify } from 'node:util';
import {
  AudioPlayer,
  AudioPlayerStatus,
  AudioResource,
  createAudioPlayer,
  DiscordGatewayAdapterCreator,
  entersState,
  joinVoiceChannel,
  VoiceConnection,
  VoiceConnectionDisconnectReason,
  VoiceConnectionStatus,
} from '@discordjs/voice';
import type { PlayItem } from './play-item.js';

const wait = promisify(setTimeout);

export class PlayQueue {
  public readonly audioPlayer: AudioPlayer;

  private voiceConnection: VoiceConnection;

  public queue: PlayItem[];

  public queueLock = false;

  public readyLock = false;

  public constructor() {
    this.audioPlayer = createAudioPlayer();
    this.queue = [];

    // Configure audio player
    this.audioPlayer.on(
      'stateChange',
      (
        oldState: { status: any; resource: any; },
        newState: { status: any; resource: any; },
      ) => {
        if (
          newState.status === AudioPlayerStatus.Idle
          && oldState.status !== AudioPlayerStatus.Idle
        ) {
          // Playing is finished
          (oldState.resource as AudioResource<PlayItem>).metadata.onFinish();
          this.processQueue();
        }
      },
    );

    this.audioPlayer.on(
      'error',
      (error: { resource: any; }) => {
        (error.resource as AudioResource<PlayItem>).metadata.onError(error as unknown as Error);
      },
    );
  }

  /**
   * Adds a new PlayItem to the queue.
   *
   * @param item The item to add to the queue
   */
  public enqueue(item: PlayItem) {
    this.queue.push(item);
    this.processQueue();
  }

  /**
   * Stops audio playback and empties the queue.
   */
  public stop() {
    this.queueLock = true;
    this.queue = [];
    this.queueLock = false;
    this.audioPlayer.stop(true);
  }

  private createVoiceConnection(
    channelId: string,
    guildId: string,
    adapterCreator: DiscordGatewayAdapterCreator,
  ): void {
    this.voiceConnection = joinVoiceChannel({
      channelId,
      guildId,
      adapterCreator,
    });

    this.voiceConnection.on(
      'stateChange',
      async (_: any, newState: { status: any; reason: any; closeCode: number; }) => {
        if (newState.status === VoiceConnectionStatus.Disconnected) {
          if (
            newState.reason === VoiceConnectionDisconnectReason.WebSocketClose
            && newState.closeCode === 4014
          ) {
            /**
             * If the WebSocket closed with a 4014 code, this means that we should not manually
             * attempt to reconnect, but there is a chance the connection will recover itself if
             * the reason of the disconnect was due to switching voice channels. This is also
             * the same code for the bot being kicked from the voice channel, so we allow 5
             * seconds to figure out which scenario it is. If the bot has been kicked, we should
             * destroy the voice connection.
             */
            try {
              await entersState(this.voiceConnection, VoiceConnectionStatus.Connecting, 5_000);
              // Probably moved voice channel
            } catch {
              this.voiceConnection.destroy();
              this.voiceConnection = undefined;
              // Probably removed from voice channel
            }
          } else if (this.voiceConnection.rejoinAttempts < 5) {
          /**
           * The disconnect in this case is recoverable, and we also have <5 repeated attempts
           * so we will reconnect.
           */
            await wait((this.voiceConnection.rejoinAttempts + 1) * 5_000);
            this.voiceConnection.rejoin();
          } else {
          /**
           * The disconnect in this case may be recoverable, but we have no more remaining attempts
           */
            this.voiceConnection.destroy();
            this.voiceConnection = undefined;
          }
        } else if (newState.status === VoiceConnectionStatus.Destroyed) {
        /**
         * Once destroyed, stop the queue.
         */
          this.stop();
        } else if (
          !this.readyLock
        && (
          newState.status === VoiceConnectionStatus.Connecting
          || newState.status === VoiceConnectionStatus.Signalling
        )
        ) {
        /**
         * In the Signalling or Connecting states, we set a 20 second time limit for the
         * connection to become ready before destroying the voice connection. This stops the
         * voice connection permanently existing in one of these states.
         */
          this.readyLock = true;
          try {
            await entersState(this.voiceConnection, VoiceConnectionStatus.Ready, 20_000);
          } catch {
            if (this.voiceConnection.state.status !== VoiceConnectionStatus.Destroyed) {
              this.voiceConnection.destroy();
              this.voiceConnection = undefined;
            }
          } finally {
            this.readyLock = false;
          }
        }
      },
    );

    this.voiceConnection.subscribe(this.audioPlayer);
  }

  /**
   * Attempts to play an item from the queue.
   */
  private async processQueue(): Promise<void> {
    // If the queue is locked (already being processed) or the audio player is already playing
    if (this.queueLock || this.audioPlayer.state.status !== AudioPlayerStatus.Idle) {
      return;
    }

    if (this.queue.length === 0) {
      // The queue is empty, destroy the voice connection
      if (this.voiceConnection) {
        this.voiceConnection.destroy();
        this.voiceConnection = undefined;
        return;
      }
    }

    // Lock the queue to guarantee safe access
    this.queueLock = true;

    // Take the first item from the queue.
    const nextItem = this.queue.shift()!;
    try {
      // Create a new voice connection (if necessary)
      if (!this.voiceConnection) {
        this.createVoiceConnection(
          nextItem.msg.member.voice.channel.id,
          nextItem.msg.member.voice.guild.id,
          nextItem.msg.member.voice.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
        );
      }

      // Attempt to convert the Item into an AudioResource (i.e. start streaming the item)
      const resource = await nextItem.createAudioResource();
      this.audioPlayer.play(resource);
      nextItem.onStart();

      this.queueLock = false;
    } catch (error) {
      // If an error occurred, try the next item of the queue instead
      nextItem.onError(error as Error);
      this.queueLock = false;
      this.processQueue();
    }
  }
}
