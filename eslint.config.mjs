import tseslint from 'typescript-eslint';
import pooolint from '@poool/eslint-config';

export default tseslint.config(
  {
    ignores: [
      'node_modules', 'dist', '.yarn', '.dev', 'coverage', '.nyc_output',
    ],
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  ...pooolint.configs.recommended,
);
