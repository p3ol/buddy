import { on } from '../src';

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
  e.data.callback();
}, { source: window.parent });

on('test:serializePromise', async e => {
  const result = await e.data.callback();
  return result;
}, { source: window.parent });

on('test:unserializeFunctionsAndObjects', async e => {
  const result = await e.data;
  return result;
}, { source: window.parent });

on('test:parentMethodReturnValue', async e => {
  const result = await e.data.callback();
  return result;
}, { source: window.parent });

on('test:parentMethodCalledTwice', async e => {
  await e.data.callback();
  await e.data.callback();
}, { source: window.parent });

on('test:noTarget', e => {
  e.data.callback();
}, { source: window.parent });
