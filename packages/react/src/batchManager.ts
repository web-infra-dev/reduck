import { Store } from '@modern-js-reduck/store';
import { unstable_batchedUpdates } from 'react-dom';
import { Model } from '@modern-js-reduck/store/dist/types/types';

const isModel = (model: Model | any) => Boolean(model._name);

const combineSubscribe = (
  store: Store,
  subscribes: ((handler: () => void) => () => void)[],
) => {
  let changed = false;
  const handlers = new Set();

  return (handler: () => void) => {
    handlers.add(handler);

    const disposelist: any[] = [];

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

const createBatchManager = (store: Store) => {
  // Models are in using now
  const usingModelsMap = new Map<Model, number>();

  let unsubscribe: undefined | (() => void);
  const updateList: (() => void)[] = [];

  // listen to models in using
  const setupSubsribe = () => {
    if (typeof unsubscribe === 'function') {
      unsubscribe();
    }

    const modelSet = new Set<Model>();

    for (const [model, count] of usingModelsMap) {
      if (count !== 0) {
        modelSet.add(model);
      }
    }

    const subscribe = combineSubscribe(
      store,
      [...modelSet].map(m => store.use(m)[2]),
    );

    unsubscribe = subscribe(() => {
      unstable_batchedUpdates(() => {
        let update: (() => void) | undefined = updateList.shift();

        while (update) {
          update();

          update = updateList.shift();
        }
      });
    });
  };

  const changeModels = (action: 'remove' | 'add', ...models: Model[]) => {
    models.forEach(model => {
      if (!isModel(model)) {
        return;
      }

      let usingCount = usingModelsMap.get(model);

      if (action === 'add') {
        usingModelsMap.set(model, (usingCount || 0) + 1);
      } else if (action === 'remove') {
        if (usingCount) {
          usingCount -= 1;

          if (usingCount === 0) {
            usingModelsMap.delete(model);
          } else {
            usingModelsMap.set(model, usingCount);
          }
        }
      }
    });

    setupSubsribe();
  };

  // add models to listen
  const addModels = (...args: Model[]) => changeModels('add', ...args);

  // remove models to listen
  const removeModels = (...args: Model[]) => changeModels('remove', ...args);

  const pushUpdate = (update: () => void) => {
    updateList.push(update);
  };

  return {
    addModels,
    removeModels,
    pushUpdate,
  };
};

export { createBatchManager };
