import { Context, Model } from '@/types';

export const GetUnsubscribe = Symbol('getUnsubscribe');

const createSubscribe = (context: Context, model: Model) => {
  const mountedModel = context.apis.getModel(model);

  if (!mountedModel) {
    return null;
  }

  const { name } = mountedModel;
  let lastState = context.store.getState()[name];
  let unsubscribeStore: ReturnType<typeof context.store.subscribe>;
  const handlers = new Set<any>();

  const setupSubscribeStore = () => {
    // Already subscribed store
    if (unsubscribeStore) {
      return unsubscribeStore;
    }

    unsubscribeStore = context.store.subscribe(() => {
      const curState = context.store.getState()[name];

      if (lastState !== curState) {
        lastState = curState;

        handlers.forEach(handler => handler());
      }
    });

    return unsubscribeStore;
  };

  const ret = (handler: () => void) => {
    unsubscribeStore = setupSubscribeStore();
    handlers.add(handler);

    return () => {
      handlers.delete(handler);
      if (handlers.size === 0) {
        unsubscribeStore?.();
        unsubscribeStore = null;
      }
    };
  };

  // manually unsubscribe when model is unmounted
  ret[GetUnsubscribe] = () => unsubscribeStore;
  return ret;
};

const combineSubscribe = (
  context: Context,
  ...subscribes: ReturnType<typeof createSubscribe>[]
) => {
  const { store } = context;
  let changed = false;
  const handlers = new Set<any>();

  return (handler: () => void) => {
    handlers.add(handler);

    const disposer = [];

    subscribes.forEach(subscribe => {
      disposer.push(
        subscribe(() => {
          changed = true;
        }),
      );
    });

    const unsubscribeStore = store.subscribe(() => {
      if (changed) {
        changed = false;
        handlers.forEach(h => h());
      }
    });

    return () => {
      unsubscribeStore();
      disposer.forEach(dispose => dispose());
    };
  };
};

export { createSubscribe, combineSubscribe };
