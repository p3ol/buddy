import path from 'node:path';

import { defineConfig } from 'vite';

export default defineConfig({
  root: './examples',
  resolve: {
    alias: [{
      find: '~',
      replacement: path.resolve('./src'),
    }, {
      find: '@poool/buddy',
      replacement: path.resolve('./src'),
    }],
  },
  server: {
    open: process.env.NODE_ENV === 'development',
    port: Number(process.env.TEST_PORT),
  },
  define: {
    'process.env.WS_TEST_PORT':
      JSON.stringify(process.env.WS_TEST_PORT || 64001),
  },
  envDir: '../',
});
