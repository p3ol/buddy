export const uuid = () => {
  let time = window.performance.now() || Date.now();

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    let rand = Math.random() * 16;
    rand = (time + rand) % 16 | 0;
    time = Math.floor(time / 16);

    return (c === 'x' ? rand : (rand & 0x3 | 0x8)).toString(16);
  });
};

export const isFunction = f =>
  typeof f === 'function';

export const isArray = a =>
  Array.isArray(a);

export const isObject = o =>
  typeof o === 'object';

export const extend = (s, t) =>
  ({ ...s, ...t });
