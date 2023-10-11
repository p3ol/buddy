export {
  send,
  on,
  serialize,
  unserialize,
} from './lib';

export {
  setGlobalOptions,
} from './options';

export {
  isBuddy,
  isBuddyDate,
  isBuddyError,
  isBuddyFunction,
  isBuddyPromise,
  bid,
} from './utils';

export type * from './types';
export type { BuddyGlobalOptions, BuddyOptions } from './options';
