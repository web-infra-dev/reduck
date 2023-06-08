const {
  default: moduleTools,
  defineConfig,
} = require('@modern-js/module-tools');
const test = require('@modern-js/plugin-testing').default;
const config = require('../../common/config');

const react17Config = {
  displayName: 'ReactDOM 17',
  moduleNameMapper: {
    '^react$': 'react-17',
    '^react-dom$': 'react-dom-17',
    '^@testing-library/react$': '@testing-library/react-12',
  },
};

const react18Config = {
  displayName: 'ReactDOM 18',
};

module.exports = defineConfig({
  ...config,
  plugins: [moduleTools(), test()],
  testing: {
    jest: options => {
      const { moduleNameMapper } = options;
      delete options.moduleNameMapper;
      return {
        ...options,
        collectCoverage: true,
        projects: [
          {
            ...react17Config,
            moduleNameMapper: {
              ...moduleNameMapper,
              ...react17Config.moduleNameMapper,
            },
          },
          {
            ...react18Config,
            moduleNameMapper,
          },
        ],
      };
    },
  },
});
