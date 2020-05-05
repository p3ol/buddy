import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { eslint } from 'rollup-plugin-eslint';
import { terser } from 'rollup-plugin-terser';

const isForIE = process.env.BABEL_ENV === 'ie';
const input = './src/index.js';
const output = `./dist${isForIE ? '/ie' : ''}/buddy`;
const defaultExternals = [];
const defaultGlobals = {};

const defaultPlugins = [
  eslint(),
  babel({
    exclude: 'node_modules/**',
    babelHelpers: 'runtime',
  }),
  resolve(),
  commonjs(),
];

export default [
  // umd
  {
    input,
    plugins: [
      ...defaultPlugins,
      terser(),
    ],
    external: defaultExternals,
    output: {
      file: `${output}.min.js`,
      format: 'umd',
      name: 'buddy',
      sourcemap: true,
      globals: defaultGlobals,
    },
  },

  // cjs
  {
    input,
    plugins: [
      ...defaultPlugins,
      terser(),
    ],
    external: defaultExternals,
    output: {
      file: `${output}.cjs.js`,
      format: 'cjs',
      sourcemap: true,
    },
  },

  // esm
  {
    input,
    plugins: [
      ...defaultPlugins,
    ],
    external: defaultExternals,
    output: {
      file: `${output}.esm.js`,
      format: 'esm',
      sourcemap: true,
    },
  },
];
