export type BuddyPrimitiveData =
  | string
  | number
  | boolean
  | null
  | undefined
  | Date
  // `Function` is expected here as we can toss any function in buddy to be sent
  // to the child without type checking
  // eslint-disable-next-line @typescript-eslint/ban-types
  | Function
  | Promise<any>;

export type BuddyData =
  | BuddyPrimitiveData
  | Array<BuddyPrimitiveData>
  | { [key: string]: BuddyPrimitiveData };

export interface BuddyOptions {
  /**
   * Message expiration time, after which an error will be thrown.
   * @default 5000
   */
  timeout?: number;

  /**
   * Either `0` (disabled), `1` (error), `2` (warn), `3` (info), `4` (debug),
   * `5` (log)
   * @default 0
   */
  logLevel?: number;

  /**
   * If `true`, messages will be queued until the target window is ready to
   * receive them.
   * Needs to also be set inside the target window to trigger a ready event.
   * @default false
   */
  queue?: boolean;

  /**
   * Source window
   * @default window
   */
  source?: Window;

  /**
   * Origin expected from source window
   * @default '*'
   */
  origin?: string;

  /**
   * Mostly used internally. Whether sender should await a response from
   * receiver or not.
   * @default false
   * @internal
   */
  pingBack?: boolean;

  /**
   * Callback to be called when a message produces an error
   * (even when unserializing data)
   */
  onError?: (error: Error) => void;
}

export interface BuddyEvent {
  /**
   * Message id
   */
  bid: string;

  /**
   * Event name
   */
  name: string;

  /**
   * Source window
   */
  source: Window;

  /**
   * Origin of the source window
   */
  origin: string;

  /**
   * Data sent with the message
   */
  data: BuddyData;
}

export function send(
  /**
   * Target window
   */
  target: Window,

  /**
   * Event name
   */
  name: string,

  /**
   * Data to send
   */
  data: BuddyData,

  /**
   * Message options
   * @default {}
   */
  options?: BuddyOptions
): Promise<any>;

export interface BuddyOffSwitch {
  /**
   * Allows to stop listening to the event
   */
  off: () => void;
}

export function on(
  /**
   * Event name
   */
  name: string,

  /**
   * Callback to be called when the event is received
   */
  fn: (event: BuddyEvent) => BuddyData | void,

  /**
   * Message options
   */
  options?: BuddyOptions
): BuddyOffSwitch;
