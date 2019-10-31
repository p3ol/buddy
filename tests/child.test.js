import { on } from 'buddy';

on('test:messaging', e => {
  return 'response:messaging';
}, { source: window.parent });

on('test:wrongWindow', e => {
  return 'response:wrongWindow';
}, { source: window });

on('test:serializeMethod', e => {
  e.data.callback();
}, { source: window.parent });

on('test:parentMethodReturnValue', async e => {
  const result = await e.data.callback();
  return result;
}, { source: window.parent });
