import {
  type BuddyEvent,
  type BuddySerializableObject,
  on,
  isBuddy,
  bid,
} from '@poool/buddy';

export interface CustomMap extends BuddySerializableObject {
  type: 'map';
  entries: [string, string][];
}

on('test:messaging', () => {
  return 'response:messaging';
}, { source: window.parent });

on('test:wrongWindow', () => {
  return 'response:wrongWindow';
}, { source: window });

on('test:serializeArray', (e: BuddyEvent<string[]>) => {
  return e.data;
}, { source: window.parent });

on('test:serializeMethod', (e: BuddyEvent<{ serializeMethod: () => void }>) => {
  e.data.serializeMethod();
}, { source: window.parent });

on('test:serializePromise', async (e: BuddyEvent<() => Promise<string>>) => {
  const result = await e.data();

  return result;
}, { source: window.parent });

on('test:serializeUnknown', async e => {
  return e.data;
}, { source: window.parent });

on('test:serializeCustom', async (e: BuddyEvent<Map<string, string>>) => {
  return Promise.resolve(e.data instanceof Map && e.data.get('foo') === 'bar'
    ? BigInt(9007199254740991)
    : null);
}, {
  source: window.parent,
  serializers: [{
    unserializable: d => isBuddy(d) && (d as CustomMap).type === 'map',
    unserialize: d => new Map((d as CustomMap).entries),
  }, {
    serializable: d => typeof d === 'bigint',
    serialize: d => ({ bid: bid(), type: 'bigint', value: d.toString() }),
  }],
});

on('test:unserializeFunctionsAndObjects', async e => {
  const result = await e.data;

  return result;
}, { source: window.parent });

on('test:parentMethodReturnValue', async (
  e: BuddyEvent<{ parentCallback: () => Promise<string> }>
) => {
  const result = await e.data.parentCallback();

  return result;
}, { source: window.parent });

on('test:parentMethodCalledTwice', async (
  e: BuddyEvent<{ callback: () => Promise<void> }>
) => {
  await e.data.callback();
  await e.data.callback();
}, { source: window.parent });

on('test:noTarget', async (e: BuddyEvent<{ callback: () => void }>) => {
  e.data.callback();

  return Promise.resolve();
}, { source: window.parent });

on('test:nestedArrayResponseFromChild', async (
  e: BuddyEvent<{
    callback: (
      type: string,
      opts?: { callback: (() => string) }
    ) => Promise<string>;
  }>
) => {
  await e.data.callback('init', { callback: () => 'response from child' });
}, { source: window.parent });

on('test:primitiveTypes', (e: BuddyEvent<string>) => {
  return e.data;
}, { source: window.parent });

on('test:back-and-forth', async (
  e: BuddyEvent<{ callback: () => Promise<void> }>
) => {
  const res = await e.data.callback();

  return JSON.stringify(res);
}, { source: window.parent });

on('test:throw', async (
  e: BuddyEvent<{ promiseThatThrows: () => Promise<void> }>
) => {
  return e.data.promiseThatThrows();
}, { source: window.parent });

on('test:throw-deep', async (
  e: BuddyEvent<{ promiseThatThrows: () => Promise<void> }>
) => {
  try {
    await e.data.promiseThatThrows();

    return 'success';
  } catch (er) {
    return er.message;
  }
}, { source: window.parent });

on('test:throw-custom-error', async (
  e: BuddyEvent<{ promiseThatThrows: () => Promise<void> }>
) => {
  return e.data.promiseThatThrows();
}, { source: window.parent });

setTimeout(() => {
  on('test:delayed', () => {
    return 'response:delayed';
  }, { queue: true, source: window.parent });
}, 100);
