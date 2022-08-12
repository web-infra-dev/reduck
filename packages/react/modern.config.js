const config = require('../../common/config');

const react17Config = {
  // ...tsStandardConfig,
  displayName: 'ReactDOM 17',
  moduleNameMapper: {
    '^react$': 'react-17',
    '^react-dom$': 'react-dom-17',
    '^@testing-library/react$': '@testing-library/react-12',
  },
};

const react18Config = {
  // ...tsStandardConfig,
  displayName: 'ReactDOM 18',
  // moduleNameMapper: {
  //   '../../src/index': '<rootDir>/src/next',
  // },
};

module.exports = {
  ...config,
  tools: {
    jest: {
      projects: [react17Config, react18Config],
    },
  },
};
