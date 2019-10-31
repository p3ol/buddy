window.console = window.top.console;

window.buddy.on('test:messaging', e => {
  return 'response:messaging';
}, { source: window.parent });

window.buddy.on('test:wrongWindow', e => {
  return 'response:wrongWindow';
}, { source: window });

window.buddy.on('test:serializeMethod', e => {
  e.data.callback();
}, { source: window.parent });

window.buddy.on('test:parentMethodReturnValue', async e => {
  const result = await e.data.callback();
  return result;
}, { source: window.parent });
