/**
 * @typedef {import('@modern-js/module-tools').ModuleUserConfig} ModuleUserConfig
*/

/**
 * @type {ModuleUserConfig}
 */
module.exports = {
  buildPreset({ preset }) {
    return preset['modern-js-universal'].filter(config => {
      // remove esm code that run in node environment.
      return !config.outDir.includes('esm-node');
    }).map(config => {
      // check es5 config, instead of es2015
      if (config.target === 'es5') {
        config.target = 'es2015';
      }
      return config;
    });
  },
  testing: {
    jest: {
      collectCoverage: true,
      collectCoverageFrom: [
        '<rootDir>/**/src/**/*.{ts,tsx}',
        '!<rootDir>/**/src/types/**/*.{ts,tsx}',
      ],
    },
  },
};
