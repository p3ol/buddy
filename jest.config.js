module.exports = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  // coveragePathIgnorePatterns: [
  //   '/node_modules/',
  //   'index.js',
  // ],
  modulePathIgnorePatterns: [
    'old',
  ],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
};
