import { Context, Model } from '@/types';

const createSubscribe = (context: Context, model: Model) => {
  const mountedModel = context.apis.getModel(model);

  if (!mountedModel) {
    return null;
  }

  const { name } = mountedModel;
  let lastState = null;
  let unsubsribeStore: ReturnType<typeof context.store.subscribe>;
  const handlers = new Set<any>();

  const setupSubscribeStore = () => {
    // Already subscribed store
    if (unsubsribeStore) {
      return unsubsribeStore;
    }

    unsubsribeStore = context.store.subscribe(() => {
      const curState = context.store.getState()[name];

      if (lastState !== curState) {
        lastState = curState;

        handlers.forEach(handler => handler());
      }
    });

    return unsubsribeStore;
  };

  return (handler: () => void) => {
    unsubsribeStore = setupSubscribeStore();
    handlers.add(handler);

    return () => {
      handlers.delete(handler);
      if (handlers.size === 0) {
        unsubsribeStore?.();
        unsubsribeStore = null;
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

    const disposelist = [];

    subscribes.forEach(subscribe => {
      disposelist.push(
        subscribe(() => {
          changed = true;
        }),
      );
    });

    const unsubsribeStore = store.subscribe(() => {
      if (changed) {
        handlers.forEach(() => handler());
      }

      changed = false;
    });

    return () => {
      unsubsribeStore();
      disposelist.forEach(dispose => dispose());
    };
  };
};

export { createSubscribe, combineSubscribe };
