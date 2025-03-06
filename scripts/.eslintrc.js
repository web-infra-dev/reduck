module.exports = {
  extends: '@modern-js',
  parserOptions: {
    project: require.resolve('./tsconfig.json'),
  },
  rules: {
    'no-console': 'off',
  },
};
