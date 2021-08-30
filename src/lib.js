import { globalOptions } from './options';
import {
  extend,
  isArray,
  isFunction,
  isObject,
  isPromise,
  isError,
  uuid,
} from './utils';
import { log, debug, info, warn, error } from './logger';

const serialize = (
  data,
  /* istanbul ignore next: just in case */ options = {},
) => {
  options = extend(globalOptions, options);
  const { target, origin, ...rest } = options;

  if (!data) {
    log(options, 'serialize() -->', 'Data is nullish, not serializing');

    return data;
  }

  if (isArray(data)) {
    log(options, 'serialize() -->', 'Serializing array', data);

    return [...data.map(o => serialize(o, options))];
  }

  if (isError(data)) {
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
  }

  if (isPromise(data)) {
    log(options, 'serialize() -->', 'Serializing promise', data);

    const methodId = uuid();
    on(methodId, async () => {
      let res;

      try {
        res = await data;
      } catch (er) {
        res = er;
      }

      send(target, methodId, res, {
        origin,
        ...rest,
        pingBack: false,
      });
    }, { source: target, ...rest, pingBack: false });

    return { bid: methodId, type: 'promise' };
  }

  if (isFunction(data)) {
    log(options, 'serialize() -->', 'Serializing method', data);

    const methodId = uuid();
    on(methodId, async event => {
      let res;

      try {
        res = await data(...event.data.args);
      } catch (er) {
        res = er;
      }

      send(target, methodId, res, {
        origin,
        ...rest,
        pingBack: false,
      });
    }, { source: target, ...rest, pingBack: false });

    return { bid: methodId, type: 'function' };
  }

  if (!isObject(data)) {
    log(options, 'serialize() -->', 'Serializing primitive type');

    return data;
  }

  return Object.keys(data).reduce((res, k) => {
    const v = data[k];
    res[k] = serialize(v, options);

    return res;
  }, {});
};

const unserialize = (
  data,
  /* istanbul ignore next: just in case */ options = {},
) => {
  options = extend(globalOptions, options);
  const { source, origin, ...rest } = options;

  if (!data || !isObject(data)) {
    log(options, 'unserialize() -->',
      `Ignoring nullish or primitive data (type: ${typeof data}):`, data);

    return data;
  }

  const isArray_ = isArray(data);

  if (data.bid && data.type === 'error') {
    log(options,
      'unserialize() -->', 'Unserializing error:', data.name, data.message);

    const err = new Error();
    err.name = data.name;
    err.message = data.message;
    err.code = data.code;
    err.stack = data.stack;

    throw err;
  } else if (data.bid && ['function', 'promise'].includes(data.type)) {
    log(options, 'unserialize() -->', 'Unserializing method:', options.key);

    return (...args) => {
      debug(options, `Calling serialized method (name: ${options.key})`);

      return new Promise((resolve, reject) => {
        on(data.bid, e => {
          debug(options,
            `Receiving serialized method result (name: ${options.key}) -->`,
            e.data);

          resolve(e.data);
        }, { ...options, onError: reject, pingBack: false });

        debug(options,
          'Sending serialized method params to parent',
          `(name: ${options.key}) -->`,
          args.map(a => typeof a)
        );

        send(source, data.bid, {
          args: serialize(args, { target: source, origin, ...rest }),
        }, { target: source, origin, ...rest, pingBack: false });
      });
    };
  }

  return (isArray_ ? data : Object.keys(data)).reduce((res, item, i) => {
    const k = isArray_ ? i : item;
    const v = isArray_ ? item : data[k];

    if (isObject(v) && !isArray(v)) {
      log(options, 'unserialize() -->', 'Unserializing object:', v);
      res[k] = unserialize(v, { ...options, key: k });
    } else if (isObject(v) && isArray(v)) {
      log(options, 'unserialize() -->', 'Unserializing array:', v);
      res[k] = [...v.map(v_ => unserialize(v_, { ...options, key: k }))];
    } else {
      res[k] = v;
    }

    return res;
  }, isArray_ ? [] : {});
};

export const send = (target, name, data, options = {}) => {
  options = extend(globalOptions, options);
  const { origin = '*', timeout = 5000, pingBack = true, ...rest } = options;

  if (!target) {
    error(options, `Target window is not defined, aborting (event: ${name})`);

    return;
  }

  let sendTimeout;
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
      sendTimeout = setTimeout(() => {
        didTimeout = true;
        error(options,
          `Target window did not respond in time, aborting (event: ${name})`);
        reject(new Error('timeout'));
      }, timeout);

      const handler = on(event.bid, e => {
        handler.off();

        if (!didTimeout) {
          clearTimeout(sendTimeout);

          if (e.data && e.data.error) {
            error(options,
              `Error received from target window, aborting (event: ${name})`);

            return reject(new Error(e.data.error.toString()));
          } else if (e.data && isError(e.data)) {
            return reject(e.data);
          }

          resolve(e.data);
        }
      }, { source: target, origin, ...rest, onError: reject, pingBack: false });
    }

    let parsedData;

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
    target.postMessage(parsedData, origin);
  });
};

export const on = (name, fn, options = {}) => {
  options = extend(globalOptions, options);
  const { source, origin = '*', pingBack = true, ...rest } = options;

  debug(options,
    `Registering message handler from target window (event: ${name})`);

  const handler = e => {
    let event = {};

    try {
      if (typeof e.data === 'string') {
        event = JSON.parse(e.data);
      }
    } catch (err) {
      warn(options, 'Error parsing event data:', err);
    }

    if (!event.name || event.name !== name || !event.bid) {
      return;
    }

    if (source && e.source !== source) {
      send(e.source, event.bid, { error: 'source' },
        { ...rest, origin: e.origin, pingBack: false });

      return;
    }

    if (origin && origin !== '*' && e.origin !== origin) {
      send(e.source, event.bid, { error: 'origin' },
        { ...rest, origin: e.origin, pingBack: false });

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
      source: e.source,
      origin: e.origin,
      data: unserializedData,
    }))()).then(result => {
      if (pingBack !== false) {
        debug(options,
          `Sending back message result to source window (event: ${name})`);

        send(source || e.source, event.bid, result, {
          ...rest,
          origin: e.origin,
          pingBack: false,
        });
      }
    }).catch(er => {
      if (pingBack !== false) {
        error(options,
          `Sending back error to source window (event: ${name})`);

        send(source || e.source, event.bid, er, {
          ...rest,
          origin: e.origin,
          pingBack: false,
        });
      }
    });
  };

  window.addEventListener('message', handler, false);

  return {
    off: () => {
      info(options,
        `Unregistering message handler from target window (event: ${name})`);
      window.removeEventListener('message', handler);
    },
  };
};
