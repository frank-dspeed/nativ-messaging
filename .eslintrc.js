module.exports = {
  env: {
    //    es6: true,
    node: true,
    es2021: true,
    mocha: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['prettier'],
  rules: {
    //indent: ['error', 4],
    'prettier/prettier': 'error',
    'no-console': 'error',
    curly: ['error', 'all'],
    'prefer-arrow-callback': 'error',
    'one-var': ['error', 'never'],
    'no-var': 'error',
    'prefer-const': 'error',
  },
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
};
