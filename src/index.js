import { uuid, isFunction, isArray, isObject } from './utils';

const serialize = (data, { target, origin } = {}) => {
  if (!data) {
    return data;
  }

  if (isArray(data)) {
    return [...data.map(o => serialize(o, { target, origin }))];
  }

  if (isFunction(data)) {
    const methodId = uuid();
    const handler = on(methodId, event => {
      handler.off();
      send(target, methodId, data(...event.data.args), { origin });
    }, { source: target, origin, pingBack: false });
    return { bid: methodId, type: 'function' };
  }

  if (!isObject(data)) {
    return data;
  }

  return Object.entries(data).reduce((res, [k, v]) => {
    res[k] = serialize(v, { target, origin });
    return res;
  }, {});
};

const unserialize = (data = {}, options = {}) => {
  if (!isObject(data)) {
    return data;
  }

  return Object.entries(data).reduce((res, [k, v]) => {
    if (v.bid && v.type === 'function') {
      res[k] = (...args) => {
        return new Promise((resolve, reject) => {
          const targetOptions =
            { target: options.source, origin: options.origin };

          on(v.bid, (e) => resolve(e.data), { ...options, pingBack: false });

          send(options.source, v.bid, {
            args: serialize(args, targetOptions),
          }, targetOptions);
        });
      };
    } else if (isObject(v) && !isArray(v)) {
      res[k] = unserialize(v, options);
    } else {
      res[k] = v;
    }

    return res;
  }, {});
};

export const send = (target, name, data, {
  origin = '*',
} = {}) =>
  new Promise((resolve, reject) => {
    if (!target) {
      return;
    }

    const event = {
      name,
      bid: uuid(),
      data: serialize(data, { target, origin }),
    };

    const handler = on(event.bid, (e) => {
      handler.off();
      resolve(e.data);
    }, { source: target, origin, pingBack: false });

    target.postMessage(JSON.stringify(event), origin);
  });

export const on = (name, cb, {
  source,
  origin = '*',
  pingBack = true,
} = {}) => {
  const handler = async e => {
    if (
      (origin && origin !== '*' && e.origin !== origin) ||
      (source && e.source !== source)
    ) {
      return;
    }

    let event = {};
    try {
      event = JSON.parse(e.data);
    } catch (e) {}

    if (event.name === name && event.bid) {
      const result = await cb({
        bid: event.bid,
        name: event.name,
        source: e.source,
        origin: e.origin,
        data: unserialize(event.data, { source, origin }),
      });

      if (pingBack !== false) {
        send(source, event.bid, result, { origin: e.origin });
      }
    }
  };

  window.addEventListener('message', handler, false);

  return {
    off: () => window.removeEventListener('message', handler),
  };
};
