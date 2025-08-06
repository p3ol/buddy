import sinon from 'sinon';

import {
  type BuddySerializableObject,
  isBuddy,
  send,
  bid,
  on,
} from '@poool/buddy';

export interface CustomBigInt extends BuddySerializableObject {
  type: 'bigint';
  value: string;
}

const createElement = (id: string, content: string) => {
  const elmt = document.createElement('div');
  elmt.id = id;
  elmt.innerText = content;
  document.body.appendChild(elmt);
};

const sendExpectingError = async (...args: Parameters<typeof send>) => {
  let error;

  try {
    error = await send(...args);
  } catch (e) {
    error = e.message;
  }

  return error;
};

const frame = document.querySelector<HTMLIFrameElement>('#child');

const exec = async () => {
  const contentWindow = frame.contentWindow;

  // test:messaging
  const messaging = await send(contentWindow, 'test:messaging', '');
  createElement('messaging', messaging);

  // test:wrongWindow
  const wrongWindow = await sendExpectingError(contentWindow,
    'test:wrongWindow', '');
  createElement('wrong-window', wrongWindow);

  // test:serializeArray
  const serializeArray = await send(contentWindow, 'test:serializeArray',
    [0, 1]);
  createElement('serialize-array', JSON.stringify(serializeArray));

  // test:serializeMethod
  const serializeMethod = sinon.spy();
  await send(contentWindow, 'test:serializeMethod', { serializeMethod });
  createElement('serialize-method', '' + serializeMethod.called);

  // test:serializePromise
  const serializePromise = new Promise(resolve => resolve('promise result'));
  const promiseResult = await send(contentWindow, 'test:serializePromise',
    serializePromise);
  createElement('serialize-promise', promiseResult);

  // test:serializeUnknown
  const serializeUnknown = BigInt(9007199254740991);
  const unknownResult = await send(contentWindow,
    'test:serializeUnknown', serializeUnknown);
  createElement('serialize-unknown', unknownResult);

  // test:serializeCustom
  const serializeCustom = new Map();
  serializeCustom.set('foo', 'bar');
  const customResult = await send(contentWindow,
    'test:serializeCustom', serializeCustom, {
      serializers: [{
        serializable: d => d instanceof Map,
        serialize: d => ({
          bid: bid(), type: 'map', entries: Array.from(d.entries()),
        }),
      }, {
        unserializable: d => isBuddy(d) &&
          (d as CustomBigInt).type === 'bigint',
        unserialize: d => BigInt((d as CustomBigInt).value),
      }],
    });
  createElement('serialize-custom', typeof customResult);

  // test:unserializeFunctionsAndObjects
  const unserializeFunction = (x: number) => x + 1;
  const unserializeObject = { test: true };
  const unserializedData = await send(
    contentWindow,
    'test:unserializeFunctionsAndObjects',
    { unserializeFunction, unserializeObject },
  );
  createElement('unserialize-functions-objects', JSON.stringify({
    unserializedFunction: await unserializedData.unserializeFunction(0),
    unserializedObject: unserializedData.unserializeObject,
  }));

  // test:parentMethodReturnValue
  const parentCallback = sinon.spy(() => 'result from parent');
  const parentResult = await send(contentWindow,
    'test:parentMethodReturnValue', { parentCallback });
  createElement('parent-method-return-value', parentResult);

  // test:thisDoesNotExistInChild
  const noHandler = await sendExpectingError(contentWindow,
    'test:thisDoesNotExistInChild', '', { origin: '*', timeout: 100 });
  createElement('this-does-not-exist-in-child', noHandler);

  // test:parentMethodCalledTwice
  const parentCallback2 = sinon.spy();
  await send(contentWindow, 'test:parentMethodCalledTwice',
    { callback: parentCallback2 });
  createElement('parent-method-called-twice', '' + parentCallback2.calledTwice);

  // test:noTarget
  const targetCallback = sinon.spy();
  await sendExpectingError(null, 'test:noTarget', { callback: targetCallback });
  createElement('no-target', '' + targetCallback.called);

  // test:nestedArrayResponseFromChild
  let nestedTest = null;
  const doAction = sinon.spy(async (_, obj) => {
    nestedTest = await obj.callback();
  });
  await send(contentWindow, 'test:nestedArrayResponseFromChild',
    { callback: doAction });
  createElement('nested-array-response-from-child', nestedTest);

  // test:primitiveTypes
  const primitiveBool = await send(contentWindow,
    'test:primitiveTypes', true);
  createElement('primitive-type-boolean', primitiveBool);

  const primitiveInt = await send(contentWindow,
    'test:primitiveTypes', 1);
  createElement('primitive-type-int', primitiveInt);

  const primitiveString = await send(contentWindow,
    'test:primitiveTypes', 'foo');
  createElement('primitive-type-string', JSON.stringify(primitiveString));

  const primitiveArray = await send(contentWindow,
    'test:primitiveTypes', ['foo', 'bar']);
  createElement('primitive-type-array', JSON.stringify(primitiveArray));

  // test:back-and-forth
  const backAndForth = sinon.spy(async () => Promise.resolve(true));
  const backAndForthResult = await send(contentWindow, 'test:back-and-forth', {
    callback: backAndForth,
  });
  createElement('back-and-forth', backAndForthResult);

  // test:throw
  const throws = sinon.spy(async () => {
    return Promise.reject(new Error('custom_error'));
  });
  const throwsResult = await sendExpectingError(contentWindow,
    'test:throw', { promiseThatThrows: throws });
  createElement('throw', throwsResult);

  // test:throw-deep
  const throwsDeep = sinon.spy(async () => {
    return Promise.all([
      (async () => {
        return Promise.reject(new Error('custom_deep_error'));
      })(),
    ]);
  });
  const throwsDeepResult = await send(contentWindow,
    'test:throw-deep', { promiseThatThrows: throwsDeep });
  createElement('throw-deep', throwsDeepResult);

  // test:throw-custom-error
  const throwsCustomError = sinon.spy(async () => {
    const err = { foo: 'custom_error_object' };

    // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
    return Promise.reject(err);
  });
  const throwsCustomErrorResult = await send(contentWindow,
    'test:throw-custom-error', { promiseThatThrows: throwsCustomError });
  createElement('throw-custom-error', throwsCustomErrorResult.foo);

  // test:delayed
  const delayedResult = await send(contentWindow, 'test:delayed', {},
    { queue: true });
  createElement('delayed', delayedResult);

  // test:ws
  const sendWsMessage = (): Promise<string> => new Promise(resolve => {
    const ws = new WebSocket(
      'ws://localhost:' + (process.env.WS_TEST_PORT || 64001)
    );
    ws.addEventListener('open', async () => {
      resolve(await send(ws, 'test:ws', null, {
        source: ws, target: ws,
      }));
    });
  });
  const wsResult = await sendWsMessage();
  createElement('ws', wsResult);
};

if (frame.contentWindow) {
  on('target:loaded', () => exec(), { source: frame.contentWindow });
} else {
  frame.onload = exec;
}
