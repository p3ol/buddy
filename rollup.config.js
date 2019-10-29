import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { eslint } from 'rollup-plugin-eslint';
import { terser } from 'rollup-plugin-terser';

const defaultConfig = () => ({
  input: 'src/index.js',
  output: {
    name: 'buddy',
    sourcemap: true,
  },
  plugins: [
    eslint(),
    babel({
      exclude: 'node_modules/**',
      runtimeHelpers: true,
    }),
  ],
});

const defaultUMDConfig = (minified = false, config = defaultConfig()) => ({
  ...config,
  output: {
    ...config.output,
    format: 'umd',
  },
  plugins: [
    ...config.plugins,
    resolve(),
    commonjs(),
    minified ? terser() : null,
  ],
});

/*
  COMMONJS / MODULE CONFIG
*/
const libConfig = (config = defaultConfig()) => ({
  ...config,
  output: [
    { file: 'dist/buddy.cjs.js', format: 'cjs' },
  ],
});

/*
  UMD CONFIG
*/
const umdConfig = (config = defaultUMDConfig()) => ({
  ...config,
  output: {
    ...config.output,
    file: 'dist/buddy.js',
  },
});

const umdMinConfig = (config = defaultUMDConfig(true)) => ({
  ...config,
  output: {
    ...config.output,
    file: 'dist/buddy.min.js',
  },
});

export default [
  libConfig(),
  umdConfig(),
  umdMinConfig(),
];
