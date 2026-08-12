import type { UserConfig } from '@commitlint/types';

const ERROR = 2;

const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [ERROR, 'always', [
      'chore', 'feat', 'refactor', 'fix', 'docs', 'test', 'tests',
    ]],
  },
};

export default config;
