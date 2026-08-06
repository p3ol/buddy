// @ts-check

import { defineConfig, globalIgnores } from 'eslint/config';
import pooolint from '@poool/eslint-config';

export default defineConfig(
  globalIgnores([
    'node_modules', 'dist', '.yarn', '.dev', 'coverage', '.nyc_output',
  ]),
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  pooolint.configs.recommended,
);
