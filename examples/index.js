import { send } from '@poool/buddy';
import sinon from 'fixed-sinon';

const createElement = (id, content) => {
  const elmt = document.createElement('div');
  elmt.id = id;
  elmt.innerText = content;
  document.body.appendChild(elmt);
};

const sendExpectingError = async (...args) => {
  let error;

  try {
    error = await send(...args);
  } catch (e) {
    error = e.message;
  }

  return error;
};

const frame = document.querySelector('#child');

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
  createElement('serialize-method', serializeMethod.called);

  // test:serializePromise
  const serializePromise = new Promise(resolve => resolve('promise result'));
  const promiseResult = await send(contentWindow, 'test:serializePromise',
    { serializePromise });
  createElement('serialize-promise', promiseResult);

  // test:unserializeFunctionsAndObjects
  const unserializeFunction = x => x + 1;
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
  createElement('parent-method-called-twice', parentCallback2.calledTwice);

  // test:noTarget
  const targetCallback = sinon.spy();
  await sendExpectingError(null, 'test:noTarget', { callback: targetCallback });
  createElement('no-target', targetCallback.called);

  // test:nestedArrayResponseFromChild
  let nestedTest = null;
  const doAction = sinon.spy(async (_, obj) => {
    nestedTest = await obj.callback();
  });
  await send(contentWindow, 'test:nestedArrayResponseFromChild',
    { callback: doAction });
  createElement('nested-array-response-from-child', nestedTest);
};

if (frame.contentWindow) {
  exec();
} else {
  frame.onload = exec;
}
