import { on, setGlobalOptions } from '@poool/buddy';

setGlobalOptions({ logLevel: 5 });

on('test:messaging', () => {
  return 'This is a response from the child window';
}, { origin: window.origin });
