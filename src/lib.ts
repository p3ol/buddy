import type {
  BuddyError,
  BuddyEvent,
  CustomError,
  BuddyFunctionData,
  BuddyOffSwitch,
  BuddyHandler,
  BuddySerializableData,
  BuddySerializedData,
  BuddySerializableArray,
  BuddySerializedArray,
  BuddySerializedComplex,
  BuddySerializablePrimitive,
  BuddySerializedDate,
  BuddySerializedObject,
} from './types';
import type { BuddyOptions } from './options';
import { extendGlobalOptions } from './options';
import {
  isArray,
  isFunction,
  isObject,
  isPromise,
  isError,
  isBuddy,
  isBuddyError,
  isPrimitive,
  isDate,
  uuid,
  isSet,
  isBuddyDate,
  isBuddyFunction,
  isBuddyPromise,
} from './utils';
import { log, debug, info, warn, error } from './logger';

const serialize = (
  data: BuddySerializableData | BuddySerializedData,
  options: BuddyOptions = {},
  const { target, origin, ...rest } = options;
): BuddySerializedData => {
  options = extendGlobalOptions(options);

  if (isPrimitive(data) || isBuddy(data)) {
    log(options, 'serialize() -->',
      'Data is primitive or already serialized, no need to (re)serialize',
      'Data:', data, 'Type:', typeof data);

    return data as BuddySerializedData;
  } else if (isArray(data) || isSet(data)) {
    log(options, 'serialize() -->', 'Serializing array', data);

    return [
      ...Array.from(data as BuddySerializableArray)
        .map((o: any) => serialize(o, options)),
    ] as BuddySerializedArray;
  } else if (isError(data)) {
    const err = data as CustomError;

    log(options,
      'serialize() -->', 'Serializing error', err.name, err.message);

    return {
      bid: uuid(),
      type: 'error',
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: err.code,
    } as BuddyError;
  } else if (isDate(data)) {
    log(options, 'serialize() -->', 'Serializing date', data);

    return {
      bid: uuid(),
      type: 'date',
      value: (data as Date).toISOString(),
    } as BuddySerializedDate;
  } else if (isPromise(data)) {
    log(options, 'serialize() -->', 'Serializing promise', data);

    const methodId = uuid();
    on(methodId, async () => {
      let res;

      try {
        res = await data;
      } catch (error) {
        res = isError(error) || isBuddyError(error) ? error : {
          bid: methodId,
          type: 'error',
          name: 'CustomError',
          error,
        };
      }

      send(target, methodId, res, {
        origin,
        ...rest,
        pingBack: false,
      });
    }, { source: target, ...rest, pingBack: false, queue: false });

    return { bid: methodId, type: 'promise' } as BuddySerializedComplex;
  } else if (isFunction(data)) {
    const fn = data as Function;

    log(options, 'serialize() -->', 'Serializing function', data);

    const methodId = uuid();
    on(methodId, async (event: BuddyEvent) => {
      let res;

      try {
        res = await fn(...(event.data as BuddyFunctionData).args);
      } catch (error) {
        res = isError(error) || isBuddyError(error) ? error : {
          bid: methodId,
          type: 'error',
          name: 'CustomError',
          error,
        };
      }

      send(target, methodId, res, {
        origin,
        ...rest,
        pingBack: false,
      });
    }, { source: target, ...rest, pingBack: false, queue: false });

    return { bid: methodId, type: 'function' } as BuddySerializedComplex;
  } else if (isObject(data)) {
    return Object
      .keys(data)
      .reduce((res: Record<string, any>, k: string) => {
        const v = (data as Record<string, any>)[k];
        res[k] = serialize(v, options);

        return res;
      }, {});
  } else {
    warn(options,
      'serialize() -->', 'Data is not serializable, returning an empty object',
      'Data:', data, 'Type:', typeof data);

    return {};
  }
};

const unserialize = (
  data: BuddySerializedData,
  options: BuddyOptions = {},
): BuddySerializableData => {
  options = extendGlobalOptions(options);
  const { source, origin, ...rest } = options;

  if (isPrimitive(data)) {
    log(options, 'unserialize() -->',
      `Ignoring nullish or primitive data (type: ${typeof data}):`, data);

    return data as BuddySerializablePrimitive;
  }

  const isArray_ = isArray(data);

  if (isBuddyError(data)) {
    const d = data as BuddyError;

    if (d.error) {
      log(options, 'unserialize() -->', 'Unserializing error:', d.error);

      throw d.error;
    } else {
      log(options,
        'unserialize() -->', 'Unserializing error:', d.name, d.message);

      const err = new Error() as CustomError;
      err.name = d.name;
      err.message = d.message;
      err.code = d.code;
      err.stack = d.stack;

      throw err;
    }
  } else if (isBuddyDate(data)) {
    const d = data as BuddySerializedDate;
    log(options, 'unserialize() -->', 'Unserializing date:', d.value);

    return new Date(d.value);
  } else if (isBuddyFunction(data) || isBuddyPromise(data)) {
    const fn = data as BuddySerializedComplex;
    log(options, 'unserialize() -->', 'Unserializing method:', options.key);

    return (...args: any[]) => {
      debug(options, `Calling serialized method (name: ${options.key})`);

      return new Promise((resolve, reject) => {
        on(fn.bid, (e: BuddyEvent) => {
          debug(options,
            `Receiving serialized method result (name: ${options.key}) -->`,
            e.data);

          resolve(e.data);
        }, { ...options, onError: reject, pingBack: false, queue: false });

        debug(options,
          'Sending serialized method params to parent',
          `(name: ${options.key}) -->`,
          args.map(a => typeof a)
        );

        send(source, fn.bid, {
          args: serialize(args, { target: source, origin, ...rest }),
        }, { target: source, origin, ...rest, pingBack: false, queue: false });
      });
    };
  }

  log(options, 'unserialize() -->', 'Unserializing object-like:', data);

  return (isArray_ ? data as BuddySerializedArray : Object.keys(data)).reduce((
    res: any, item: any, i: number
  ) => {
    const k = isArray_ ? i : item;
    const v = isArray_ ? item : (data as BuddySerializedObject)[k];

    if (isObject(v) && !isArray(v)) {
      log(options, 'unserialize() -->', 'Unserializing object:', v);
      res[k] = unserialize(v, { ...options, key: k });
    } else if (isArray(v)) {
      log(options, 'unserialize() -->', 'Unserializing array:', v);
      res[k] = [...v.map((v_: any) => unserialize(v_, { ...options, key: k }))];
    } else {
      res[k] = v;
    }

    return res;
  }, isArray_ ? [] : {});
};

export const send = (
  target: Window,
  name: string,
  data: BuddySerializableData | BuddySerializedData,
  options: BuddyOptions = {}
): Promise<BuddySerializableData> => {
  options = extendGlobalOptions(options);
  const { origin = '*', timeout = 5000, pingBack = true, ...rest } = options;

  if (!target) {
    error(options, `Target window is not defined, aborting (event: ${name})`);

    return;
  }

  let sendTimeout: number;
  let queueHandler: BuddyOffSwitch;
  let didTimeout = false;

  return new Promise((resolve, reject) => {
    let serializedData;

    try {
      serializedData = serialize(data, { target, ...options });
    } catch (e) {
      warn(options,
        `Input data could not be serialized (event: ${name}) -->`, data, e);

      return reject(e);
    }

    const event = {
      name,
      bid: uuid(),
      data: serializedData,
    };

    if (pingBack) {
      const timeoutErr = new Error('timeout');
      sendTimeout = setTimeout(() => {
        queueHandler && queueHandler.off();
        didTimeout = true;
        error(options,
          `Target window did not respond in time, aborting (event: ${name})`);
        reject(timeoutErr);
      }, timeout);

      const handler = on(event.bid, (e: BuddyEvent) => {
        handler.off();
        queueHandler && queueHandler.off();

        if (!didTimeout) {
          clearTimeout(sendTimeout);

          if (e.data && (e.data as BuddyError).error) {
            error(options,
              `Error received from target window, aborting (event: ${name})`);

            return reject(new Error((e.data as BuddyError).error.toString()));
          } else if (e.data && isError(e.data)) {
            return reject(e.data);
          }

          resolve(e.data as BuddySerializableData);
        }
      }, { source: target, origin, ...rest, onError: reject, pingBack: false });
    }

    let parsedData: string;

    try {
      parsedData = JSON.stringify(event);
    } catch (e) {
      warn(
        options,
        `Event data could not be formatted to JSON (event: ${name}) -->`,
        event,
        e
      );

      throw e;
    }

    info(options,
      `Sending message to target window (event: ${name}) -->`, parsedData);

    if (options.queue) {
      info(options, 'Queueing message in case target window is not ready');
      queueHandler = on('target:loaded', () => {
        queueHandler && queueHandler.off();
        target.postMessage(parsedData, origin);
      }, { source: target, origin, ...rest, queue: false, pingBack: false });
    }

    target.postMessage(parsedData, origin);
  });
};

export const on = (
  name: string,
  fn: BuddyHandler,
  options: BuddyOptions = {}
) => {
  options = extendGlobalOptions(options);
  const { source, origin = '*', pingBack = true, ...rest } = options;

  debug(options,
    `Registering message handler from target window (event: ${name})`);

  const handler = (e: MessageEvent) => {
    let event: BuddyEvent;

    try {
      if (typeof e.data === 'string') {
        event = JSON.parse(e.data);
      }
    } catch (err) {
      warn(options, 'Error parsing event data:', err);
    }

    if (!event || !event.name || event.name !== name || !event.bid) {
      return;
    }

    if (source && e.source !== source) {
      send(e.source as Window, event.bid, { error: 'source' },
        { ...rest, origin: e.origin, pingBack: false, queue: false });

      return;
    }

    if (origin && origin !== '*' && e.origin !== origin) {
      send(e.source as Window, event.bid, { error: 'origin' },
        { ...rest, origin: e.origin, pingBack: false, queue: false });

      return;
    }

    info(options,
      `Handling message from source window (event: ${name}) -->`, event);

    let unserializedData;

    try {
      unserializedData = unserialize(event.data as BuddySerializedData,
        { source, origin, ...rest });
    } catch (er) {
      warn(options,
        `Output data could not be unserialized (event: ${name}) -->`, event);

      if (options.onError) {
        options.onError(er);

        return;
      }
    }

    Promise.resolve(fn({
      bid: event.bid,
      name: event.name,
      source: e.source as Window,
      origin: e.origin,
      data: unserializedData,
    }) as Promise<BuddySerializableData>)
      .then((result: BuddySerializableData) => {
        if (pingBack !== false) {
          debug(options,
            `Sending back message result to source window (event: ${name})`);

          send(source || e.source as Window, event.bid, result, {
            ...rest,
            origin: e.origin,
            pingBack: false,
            queue: false,
          });
        }
      })
      .catch(er => {
        if (pingBack !== false) {
          error(options,
            `Sending back error to source window (event: ${name})`);

          send(source || e.source as Window, event.bid, er, {
            ...rest,
            origin: e.origin,
            pingBack: false,
            queue: false,
          });
        }
      });
  };

  window.addEventListener('message', handler, false);

  if (options.queue) {
    send(source, 'target:loaded', {}, {
      ...rest, pingBack: false, queue: false,
    });
  }

  return {
    off: () => {
      info(options,
        `Unregistering message handler from target window (event: ${name})`);
      window.removeEventListener('message', handler);
    },
  };
};
