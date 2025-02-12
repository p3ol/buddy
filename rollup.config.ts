import path from 'node:path';

import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import swc from '@rollup/plugin-swc';

const input = './src/index.ts';
const output = './dist';
const name = 'buddy';
const formats = ['umd', 'cjs', 'esm'];

const defaultExternals: string[] = [];
const defaultGlobals = {};

const defaultPlugins = [
  commonjs(),
  resolve({
    extensions: ['.js', '.ts', '.json', '.node'],
  }),
  terser(),
];

export default [
  ...formats.map(f => ({
    input,
    plugins: [
      swc({
        swc: {
          jsc: {
            target: null,
            parser: {
              syntax: 'typescript',
            },
          },
          env: {
            targets: '>=0.2% and not dead',
          },
        },
      }),
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
          manualChunks: (id: string) => {
            return id.includes('node_modules')
              ? 'vendor'
              : path.parse(id).name;
          },
        }
        : {}),
    },
  })),
];
