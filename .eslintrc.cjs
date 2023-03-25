module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: 'google',
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    indent: ['error', 2, { SwitchCase: 1 }],
  },
  ignorePatterns: ['build/**/*'],
};
