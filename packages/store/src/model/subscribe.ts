import { Context, Model } from '@/types';

const createSubscribe = (context: Context, model: Model) => {
  const mountedModel = context.apis.getModel(model);

  if (!mountedModel) {
    return null;
  }

  const { name } = mountedModel;
  let lastState = null;
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

  return (handler: () => void) => {
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
};

const combineSubscribe = (
  context: Context,
  ...subscribes: ReturnType<typeof createSubscribe>[]
) => {
  const { store } = context;
  let changed = false;
  const handlers = new Set();

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
        handlers.forEach(() => handler());
      }
    });

    return () => {
      unsubscribeStore();
      disposer.forEach(dispose => dispose());
    };
  };
};

export { createSubscribe, combineSubscribe };
