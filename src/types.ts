export declare interface CustomError extends Error {
  code?: string | number;
}

export declare interface BuddyMessage {
  bid: string;
  type: string;
}

export declare interface BuddyPromise extends BuddyMessage {
  type: 'promise';
}

export declare interface BuddyFunction extends BuddyMessage {
  type: 'function';
}

export declare interface BuddyError {
  bid: string;
  type: 'error';
  message?: string;
  code?: string | number;
  name?: string;
  stack?: string;
  error?: Record<string, any>;
}

export type BuddyPrimitiveData =
  | string
  | number
  | boolean
  | Date
  | null
  | undefined;

export type BuddySerializableData =
  | BuddyPrimitiveData
  | BuddySerializableData[]
  | Function
  | Promise<any>
  | Error
  | CustomError;

export type BuddyData =
  | BuddySerializableData
  | BuddySerializableData[]
  | BuddyError
  | Record<
    string, BuddySerializableData | BuddySerializableData[] | BuddyError
  >;

export interface BuddyFunctionData {
  args: BuddyData[];
}

export interface BuddyEvent {
  bid: string;
  name: string;
  source: Window;
  origin: string;
  data: BuddyData | BuddyFunctionData;
}

export interface BuddyOffSwitch {
  /**
   * Allows to stop listening to the event
   */
  off: () => void;
}

export type BuddyHandler = (event: BuddyEvent) => BuddyData | void;
