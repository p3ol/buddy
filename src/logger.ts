import type { BuddyGlobalOptions } from './options';
import { extendGlobalOptions } from './options';

const logger = (
  method: 'error' | 'warn' | 'info' | 'debug' | 'log',
  logLevel: number,
  options: BuddyGlobalOptions,
  ...args: any[]
) => {
  options = extendGlobalOptions(options);

  if (options.logLevel >= logLevel) {
    // eslint-disable-next-line no-console
    console[method]('[buddy]', `[${method}]`, ...args);
  }
};

export const error = (options: BuddyGlobalOptions, ...args: any[]) =>
  logger('error', 1, options, ...args);

export const warn = (options: BuddyGlobalOptions, ...args: any[]) =>
  logger('warn', 2, options, ...args);

export const info = (options: BuddyGlobalOptions, ...args: any[]) =>
  logger('info', 3, options, ...args);

export const debug = (options: BuddyGlobalOptions, ...args: any[]) =>
  logger('debug', 4, options, ...args);

export const log = (options: BuddyGlobalOptions, ...args: any[]) =>
  logger('log', 5, options, ...args);
