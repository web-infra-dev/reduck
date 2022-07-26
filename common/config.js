module.exports = {
  tools: {
    babel: config => {
      const { presets } = config;
      for (const preset of presets) {
        if (preset[0].includes('@babel/preset-env')) {
          preset[1] = {
            targets: {
              esmodules: true,
            },
            // Use the equivalent of `babel-preset-modules`
            bugfixes: true,
            modules: false,
            loose: true,
          };
        }
      }
    },
  },
};
