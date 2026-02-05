import type { WebSocket as WebSocketConnection } from 'ws';

import type { BuddySerializer, BuddyOffSwitch } from './types';

export declare interface BuddyGlobalOptions {
  /**
   * Message expiration time, after which an error will be thrown.
   * @default 5000
   */
  timeout?: number;

  /**
   * Either `0` (disabled), `1` (error), `2` (warn), `3` (info), `4` (debug),
   * `5` (log)
   * @default 1
   */
  logLevel?: number;

  /**
   * If `true`, messages will be queued until the target window is ready
   * to receive them.
   * Needs to also be set inside the target window to trigger a ready event.
   * @default false
   */
  queue?: boolean;

  /**
   * List of custom serializers to use.
   * @default []
   */
  serializers?: BuddySerializer[];

  /**
   * Array of global message event handlers
   */
  offSwitches?: BuddyOffSwitch[];
}

export declare interface BuddyOptions extends BuddyGlobalOptions {
  /**
   * The target window to send messages to.
   * @default window.parent
   */
  target?: Window | WebSocket | WebSocketConnection;

  /**
   * The allowed origin of the target window.
   * @default *
   */
  origin?: string;

  /**
   * The source window to receive messages from.
   * @default window
   */
  source?: Window | WebSocket | WebSocketConnection;

  /**
   * List of custom serializers to use.
   * @default []
   */
  serializers?: BuddySerializer[];

  /**
   * A unique identifier used in deep recursive serialization
   * @internal
   */
  key?: string;

  /**
   * Whether sender should await a response from
   * receiver or not.
   * @default false
   * @internal
   */
  pingBack?: boolean;

  mode?: 'iframe' | 'websocket' | 'websocket-server';

  /**
   * Callback to be called when a message produces an error
   * (even when unserializing data)
   */
  onError?: (error: Error) => void;
}

export const globalOptions: BuddyGlobalOptions = {
  timeout: 5000,
  logLevel: 1,
  queue: false,
  serializers: [],
  offSwitches: [],
};

export const setGlobalOptions = (options: BuddyGlobalOptions) => {
  Object.assign(globalOptions, options);
};

export const extendGlobalOptions = (options: BuddyOptions): BuddyOptions => ({
  ...globalOptions,
  ...options,
  serializers: [
    ...globalOptions.serializers,
    ...(options.serializers || []),
  ],
});
