import path from 'node:path';
import fs from 'node:fs';

import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { dts } from 'rollup-plugin-dts';
import swc from '@rollup/plugin-swc';

const input = './src/index.ts';
const output = './dist';
const name = 'buddy';
const formats = ['umd', 'cjs', 'esm'];

const defaultExternals = [];
const defaultGlobals = {};

const defaultPlugins = [
  commonjs(),
];

export default [
  ...formats.map(f => ({
    input,
    plugins: [
      resolve({
        extensions: ['.js', '.ts', '.json', '.node'],
      }),
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
      ...defaultPlugins,
      terser(),
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
  })),
  {
    input,
    output: {
      file: `${output}/${name}.d.ts`,
      format: 'esm',
      inlineDynamicImports: true,
    },
    external: defaultExternals,
    plugins: [
      resolve({
        extensions: ['.js', '.ts', '.json', '.node'],
      }),
      typescript({
        emitDeclarationOnly: true,
        declaration: true,
        declarationDir: `${output}/types`,
        tsconfig: path.resolve('./tsconfig.json'),
        outputToFilesystem: true,
        incremental: false,
        include: ['src/**/*.ts'],
        exclude: [
          '**/*.test.ts',
          '**/tests/**/*',
        ],
      }),
      ...defaultPlugins,
      {
        writeBundle () {
          fs.unlinkSync(`${output}/${name}.d.ts`);
        },
      },
    ],
  },
  {
    input: `${output}/types/index.d.ts`,
    output: [{ file: `${output}/${name}.d.ts`, format: 'es' }],
    external: defaultExternals,
    plugins: [
      resolve({
        extensions: ['.js', '.ts', '.json', '.node'],
      }),
      dts({ respectExternal: true }),
      {
        writeBundle () {
          fs.rmSync(`${output}/types`, { recursive: true, force: true });
        },
      },
    ],
  },
];
