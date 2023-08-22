export interface globalOptions {
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
}

export function setGlobalOptions(options: globalOptions): void;
