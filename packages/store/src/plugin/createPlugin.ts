import { PluginContext, PluginLifeCycle } from '@/types/plugin';

const createPlugin = (
  defineLifeCycle: (context: PluginContext) => PluginLifeCycle,
) => defineLifeCycle;

export default createPlugin;
