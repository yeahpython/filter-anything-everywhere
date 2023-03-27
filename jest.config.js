export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'babel-jest'
  },
  transformIgnorePatterns: [],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  runner: 'jest-runner',
  moduleLoader: 'esm',
};