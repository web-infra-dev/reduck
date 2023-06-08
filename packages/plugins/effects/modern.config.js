const {
  default: moduleTools,
  defineConfig,
} = require('@modern-js/module-tools');
const test = require('@modern-js/plugin-testing').default;
const config = require('../../../common/config');

module.exports = defineConfig({
  plugins: [moduleTools(), test()],
  ...config,
});
