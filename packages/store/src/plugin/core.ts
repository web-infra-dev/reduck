import { Plugin, PluginContext, PluginLifeCycle } from '@/types/plugin';

type Stage = keyof PluginLifeCycle;

export const createPluginCore = (pluginContext: PluginContext) => {
  const lifeCycleList: PluginLifeCycle[] = [];
  const findHandlers = <S extends Stage>(stage: S) =>
    lifeCycleList.map(liftCycle => liftCycle[stage]).filter(Boolean);

  return {
    usePlugin: (plugin: Plugin) => {
      lifeCycleList.push(plugin(pluginContext));
    },
    invokePipeline: <S extends Stage>(
      stage: S,
      bypassParams: Parameters<PluginLifeCycle[S]>[0],
      ...args: Parameters<PluginLifeCycle[S]> extends [any, ...infer T] ? T : []
    ) => {
      const handlers = findHandlers(stage);

      let params = bypassParams;

      for (const handler of handlers) {
        params = (handler as any)(params, ...args);
      }

      return params;
    },
    invokeWaterFall: <S extends Stage>(
      stage: S,
      ...args: Parameters<PluginLifeCycle[S]>
    ) => {
      const handlers = findHandlers(stage);

      return handlers.forEach(handler => (handler as any)(...args));
    },
  };
};
