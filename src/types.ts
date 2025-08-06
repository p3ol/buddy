import type { WebSocket as WebSocketConnection } from 'ws';

export declare interface CustomError extends Error {
  code?: string | number;
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

// Serializables
export declare type BuddySerializablePrimitive =
  | string
  | number
  | boolean
  | bigint
  | null
  | undefined;

export declare type BuddySerializableComplex =
  | Date
  | ((...args: any[]) => any)
  | Map<string, BuddySerializableData>
  | Promise<any>
  | Error;

export declare type BuddySerializableCustom =
  | CustomError;

export declare interface BuddySerializableObject {
  [key: string]: BuddySerializableData;
}

export declare type BuddySerializableArray = BuddySerializableData[];

export declare type BuddySerializableData =
  | BuddySerializablePrimitive
  | BuddySerializableComplex
  | BuddySerializableCustom
  | BuddySerializableObject
  | BuddySerializableArray;

// Serialized
export declare interface BuddySerializedComplex {
  bid: string;
  type: string;
  [key: string]: any;
}

export declare interface BuddySerializedDate extends BuddySerializedComplex {
  type: 'date';
  value: string;
}

export declare interface BuddySerializedObject {
  [key: string]: BuddySerializedData;
}

export declare type BuddySerializedArray = BuddySerializedData[];

export declare type BuddySerializedData =
  | BuddySerializablePrimitive
  | BuddySerializedComplex
  | BuddySerializedArray
  | BuddySerializedObject
  | BuddyError;

export declare interface BuddyFunctionData {
  args: BuddySerializedData[];
}

export declare interface BuddyEvent<
  D extends BuddySerializableData | BuddyFunctionData =
    | BuddySerializableData
    | BuddyFunctionData,
> {
  bid: string;
  name: string;
  source: Window | WebSocket | WebSocketConnection;
  origin: string;
  data: D;
}

export declare interface BuddySerializedEvent<
  D extends BuddySerializedData | BuddyFunctionData =
    | BuddySerializedData
    | BuddyFunctionData,
> {
  bid: string;
  name: string;
  data: D;
}

export declare interface BuddyOffSwitch {
  /**
   * Allows to stop listening to the event
   */
  off: () => void;
}

export declare type BuddyHandler = (event?: BuddyEvent) =>
  BuddySerializableData | Promise<BuddySerializableData> | void | Promise<void>;

export declare interface BuddySerializer {
  serializable?: (data: any) => boolean;
  serialize?: (data: any) => BuddySerializedData;
  unserializable?: (data: BuddySerializedData) => boolean;
  unserialize?: (data: BuddySerializedData) => any;
}
