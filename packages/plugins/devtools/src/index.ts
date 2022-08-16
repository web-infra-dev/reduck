import { createPlugin } from '@modern-js-reduck/store';
import { devToolsEnhancer, EnhancerOptions } from '@redux-devtools/extension';

export type DevToolsOptions = EnhancerOptions;

export default (config?: EnhancerOptions) =>
  createPlugin(() => ({
    config: storeConfig => {
      const { enhancers = [] } = storeConfig;

      storeConfig.enhancers = [devToolsEnhancer(config), ...enhancers];

      return storeConfig;
    },
  }));
