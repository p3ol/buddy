import { globalOptions } from './options';
import {
  extend,
  isArray,
  isFunction,
  isObject,
  isPromise,
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

  if (isPromise(data)) {
    log(options, 'serialize() -->', 'Serializing promise', data);

    const methodId = uuid();
    on(methodId, async () => {
      send(target, methodId, await data, {
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
      send(target, methodId, await data(...event.data.args), {
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

  return (isArray_ ? data : Object.keys(data)).reduce((res, item, i) => {
    const k = isArray_ ? i : item;
    const v = isArray_ ? item : data[k];

    if (!v) {
      res[k] = v;
    } else if (v.bid && ['function', 'promise'].includes(v.type)) {
      log(options, 'unserialize() -->', 'Unserializing method:', k);

      res[k] = (...args) => {
        debug(options, `Calling serialized method (name: ${k})`);

        return new Promise(resolve => {
          on(v.bid, e => {
            debug(options,
              `Receiving serialized method result (name: ${k}) -->`, e.data);

            resolve(e.data);
          }, { ...options, pingBack: false });

          debug(options,
            `Sending serialized method params to parent (name: ${k}) -->`,
            args.map(a => typeof a)
          );

          send(source, v.bid, {
            args: serialize(args, { target: source, origin, ...rest }),
          }, { target: source, origin, ...rest, pingBack: false });
        });
      };
    } else if (isObject(v) && !isArray(v)) {
      log(options, 'unserialize() -->', 'Unserializing object:', v);
      res[k] = unserialize(v, { ...options });
    } else if (isObject(v) && isArray(v)) {
      log(options, 'unserialize() -->', 'Unserializing array:', v);
      res[k] = [...v.map(v_ => unserialize(v_, { ...options }))];
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
          }

          resolve(e.data);
        }
      }, { source: target, origin, ...rest, pingBack: false });
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
    } catch (e) {
      warn(options,
        `Output data could not be unserialized (event: ${name}) -->`, event);
    }

    Promise.resolve(fn({
      bid: event.bid,
      name: event.name,
      source: e.source,
      origin: e.origin,
      data: unserializedData,
    })).then(result => {
      if (pingBack !== false) {
        debug(options,
          `Sending back message result to source window (event: ${name})`);

        send(source, event.bid, result, {
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
