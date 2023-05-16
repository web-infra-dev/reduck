module.exports = {
  buildPreset({ preset }) {
    return preset['modern-js-universal'].filter(config => {
      // remove esm code that run in node environment.
      return !config.outDir.includes('esm-node');
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
