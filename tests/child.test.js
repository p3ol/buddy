window.console = window.top.console;

window.buddy.on('test:messaging', (e) => {
  return 'response:messaging';
}, { source: window.parent });

window.buddy.on('test:wrongWindow', (e) => {
  return 'response:wrongWindow';
}, { source: window });
