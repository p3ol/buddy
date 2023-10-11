import { on, isBuddy, bid } from '@poool/buddy';

on('test:messaging', () => {
  return 'response:messaging';
}, { source: window.parent });

on('test:wrongWindow', () => {
  return 'response:wrongWindow';
}, { source: window });

on('test:serializeArray', e => {
  return e.data;
}, { source: window.parent });

on('test:serializeMethod', e => {
  e.data.serializeMethod();
}, { source: window.parent });

on('test:serializePromise', async e => {
  const result = await e.data();

  return result;
}, { source: window.parent });

on('test:serializeUnknown', async e => {
  return e.data;
}, { source: window.parent });

on('test:serializeCustom', async e => {
  return e.data instanceof Map && e.data.get('foo') === 'bar'
    ? BigInt(9007199254740991)
    : null;
}, {
  source: window.parent,
  serializers: [{
    unserializable: d => isBuddy(d) && d.type === 'map',
    unserialize: d => new Map(d.entries),
  }, {
    serializable: d => typeof d === 'bigint',
    serialize: d => ({ bid: bid(), type: 'bigint', value: d.toString() }),
  }],
});

on('test:unserializeFunctionsAndObjects', async e => {
  const result = await e.data;

  return result;
}, { source: window.parent });

on('test:parentMethodReturnValue', async e => {
  const result = await e.data.parentCallback();

  return result;
}, { source: window.parent });

on('test:parentMethodCalledTwice', async e => {
  await e.data.callback();
  await e.data.callback();
}, { source: window.parent });

on('test:noTarget', async e => {
  e.data.callback();
}, { source: window.parent });

on('test:nestedArrayResponseFromChild', async e => {
  await e.data.callback('init', { callback: () => 'response from child' });
}, { source: window.parent });

on('test:primitiveTypes', e => {
  return e.data;
}, { source: window.parent });

on('test:back-and-forth', async e => {
  const res = await e.data.callback();

  return JSON.stringify(res);
}, { source: window.parent });

on('test:throw', async e => {
  return e.data.promiseThatThrows();
}, { source: window.parent });

on('test:throw-deep', async e => {
  try {
    await e.data.promiseThatThrows();

    return 'success';
  } catch (er) {
    return er.message;
  }
}, { source: window.parent });

on('test:throw-custom-error', async e => {
  return e.data.promiseThatThrows();
}, { source: window.parent });

setTimeout(() => {
  on('test:delayed', () => {
    return 'response:delayed';
  }, { queue: true, source: window.parent });
}, 100);
