import type {
  BuddyError,
  BuddyEvent,
  CustomError,
  BuddyFunctionData,
  BuddyOffSwitch,
  BuddyHandler,
} from './types';
import type { BuddyOptions } from './options';
import { globalOptions } from './options';
import {
  extend,
  isArray,
  isFunction,
  isObject,
  isPromise,
  isError,
  isBuddyError,
  isPrimitive,
  isDate,
  uuid,
  isSet,
} from './utils';
import { log, debug, info, warn, error } from './logger';

const serialize = (
  data: any,
  options: BuddyOptions = {},
): any => {
  options = extend(globalOptions, options);
  const { target, origin, ...rest } = options;

  if (isPrimitive(data) || data.bid) {
    log(options, 'serialize() -->',
      'Data is primitive or already serialized, no need to (re)serialize',
      'Data:', data, 'Type:', typeof data);

    return data;
  } else if (isArray(data) || isSet(data)) {
    log(options, 'serialize() -->', 'Serializing array', data);

    return [
      ...Array.from(data).map((o: any) => serialize(o, options)),
    ];
  } else if (isError(data)) {
    log(options,
      'serialize() -->', 'Serializing error', data.name, data.message);

    return {
      bid: uuid(),
      type: 'error',
      name: data.name,
      message: data.message,
      stack: data.stack,
      code: data.code,
    };
  } else if (isDate(data)) {
    log(options, 'serialize() -->', 'Serializing date', data);

    return {
      bid: uuid(),
      type: 'date',
      value: data.toISOString(),
    };
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

    return { bid: methodId, type: 'promise' };
  } else if (isFunction(data)) {
    log(options, 'serialize() -->', 'Serializing method', data);

    const methodId = uuid();
    on(methodId, async (event: BuddyEvent) => {
      let res;

      try {
        res = await data(...(event.data as BuddyFunctionData).args);
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

    return { bid: methodId, type: 'function' };
  } else if (isObject(data)) {
    return Object
      .keys(data)
      .reduce((res: Record<string, any>, k: string) => {
        const v = data[k];
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
  data: any,
  options: BuddyOptions = {},
): any => {
  options = extend(globalOptions, options);
  const { source, origin, ...rest } = options;

  if (isPrimitive(data)) {
    log(options, 'unserialize() -->',
      `Ignoring nullish or primitive data (type: ${typeof data}):`, data);

    return data;
  }

  const isArray_ = isArray(data);

  if (data.bid && data.type === 'error') {
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
  } else if (data.bid && data.type === 'date') {
    log(options, 'unserialize() -->', 'Unserializing date:', data.value);

    return new Date(data.value);
  } else if (data.bid && ['function', 'promise'].includes(data.type)) {
    log(options, 'unserialize() -->', 'Unserializing method:', options.key);

    return (...args: any[]) => {
      debug(options, `Calling serialized method (name: ${options.key})`);

      return new Promise((resolve, reject) => {
        on(data.bid, (e: BuddyEvent) => {
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

        send(source, data.bid, {
          args: serialize(args, { target: source, origin, ...rest }),
        }, { target: source, origin, ...rest, pingBack: false, queue: false });
      });
    };
  }

  log(options, 'unserialize() -->', 'Unserializing object-like:', data);

  return (isArray_ ? data : Object.keys(data)).reduce((
    res: any, item: any, i: number
  ) => {
    const k = isArray_ ? i : item;
    const v = isArray_ ? item : data[k];

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
  data: any,
  options: BuddyOptions = {}
) => {
  options = extend(globalOptions, options);
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

      const handler = on(event.bid, e => {
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

          resolve(e.data);
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
  options = extend(globalOptions, options);
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
      unserializedData = unserialize(event.data, { source, origin, ...rest });
    } catch (er) {
      warn(options,
        `Output data could not be unserialized (event: ${name}) -->`, event);

      if (options.onError) {
        options.onError(er);

        return;
      }
    }

    Promise.resolve((async () => fn({
      bid: event.bid,
      name: event.name,
      source: e.source as Window,
      origin: e.origin,
      data: unserializedData,
    }))()).then(result => {
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
    }).catch(er => {
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
