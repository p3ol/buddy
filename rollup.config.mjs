import path from 'node:path';

import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import dts from 'rollup-plugin-dts';
import swc from '@rollup/plugin-swc';

const input = './src/index.js';
const output = './dist';
const name = 'buddy';
const formats = ['umd', 'cjs', 'esm'];

const defaultExternals = [];
const defaultGlobals = {};

const defaultPlugins = [
  resolve(),
  commonjs(),
  swc({
    swc: {
      jsc: {
        target: null,
      },
      env: {
        targets: '>=0.2% and not dead',
      },
    },
  }),
  terser(),
];

export default [...formats.map(f => ({
  input,
  plugins: [
    ...defaultPlugins,
  ],
  external: defaultExternals,
  output: {
    ...(f === 'esm'
      ? { dir: `${output}/esm`, chunkFileNames: '[name].js' }
      : { file: `${output}/${name}.${f}.js` }
    ),
    format: f,
    name,
    sourcemap: true,
    globals: defaultGlobals,
    ...(f === 'esm'
      ? {
        manualChunks: id => {
          return id.includes('node_modules')
            ? 'vendor'
            : path.parse(id).name;
        },
      }
      : {}),
  },
})), {
  input: './src/index.d.ts',
  output: [{ file: `dist/${name}.d.ts`, format: 'es' }],
  plugins: [dts()],
}];
