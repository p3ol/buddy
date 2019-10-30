import { globalOptions } from './options';
import { extend } from './utils';

/* eslint-disable no-console */
const logger = (method, logLevel, options, ...args) => {
  options = extend(globalOptions, options);
  options.logLevel >= logLevel &&
    console[method]('[buddy]', `[${method}]`, ...args);
};

export const error = (options, ...args) =>
  logger('error', 1, options, ...args);

export const warn = (options, ...args) =>
  logger('warn', 2, options, ...args);

export const info = (options, ...args) =>
  logger('info', 3, options, ...args);

export const debug = (options, ...args) =>
  logger('debug', 4, options, ...args);

export const log = (options, ...args) =>
  logger('log', 5, options, ...args);
