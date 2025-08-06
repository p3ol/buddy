/**
 * Copyright (c) Poool, 2016-2025
 *
 * Unauthorized copying of this file, via any medium, is strictly prohibited.
 * Proprietary and confidential.
 */

import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['./src/index.ts'],
  outDir: 'dist/lib',
  banner: {},
  format: ['cjs', 'esm', 'iife'],
  external: [],
  sourcemap: true,
  noExternal: [
    '@junipero/core',
  ],
});
