/**
 * Generate a UUID (way dumber than RFC4122, but good enough for our purposes)
 */
export const bid = (): string => {
  let time = window.performance.now() || Date.now();

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    let rand = Math.random() * 16;
    rand = (time + rand) % 16 | 0;
    time = Math.floor(time / 16);

    return (c === 'x' ? rand : rand & 0x3 | 0x8).toString(16);
  });
};

export const isPrimitive = (p: any) =>
  typeof p === 'string' ||
  typeof p === 'number' ||
  typeof p === 'boolean' ||
  typeof p === 'undefined' ||
  p === null;

export const isDate = (d: any) =>
  d instanceof Date;

export const isFunction = (f: any) =>
  typeof f === 'function';

export const isArray = (a: any) =>
  Array.isArray(a);

export const isSet = (s: any) =>
  s instanceof Set;

export const isObject = (o: any) =>
  o && o.constructor?.name === 'Object';

export const isPromise = (p: any) =>
  p instanceof Promise;

export const isError = (e: any) =>
  e instanceof Error;

export const isBuddy = (b: any) =>
  b && b.bid && b.type;

export const isBuddyError = (e: any) =>
  isBuddy(e) && e.type === 'error';

export const isBuddyDate = (d: any) =>
  isBuddy(d) && d.type === 'date';

export const isBuddyFunction = (f: any) =>
  isBuddy(f) && f.type === 'function';

export const isBuddyPromise = (p: any) =>
  isBuddy(p) && p.type === 'promise';
