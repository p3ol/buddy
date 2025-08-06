import type { Config } from 'jest';

const config: Config = {
  clearMocks: true,
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
};

export default config;
