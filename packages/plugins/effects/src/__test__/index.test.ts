import { createStore, model } from '@modern-js-reduck/store';
import logger from 'redux-logger';
import { plugin } from '..';

const todoModel = model('todo').define((_, { use }) => ({
  state: {
    items: [],
  },
  actions: {
    load: {
      fulfilled: (state: any, payload: any) => ({
        ...state,
        items: payload,
      }),
    },
    loadWithParams: {
      fulfilled: (state: any, payload: any) => ({
        ...state,
        items: payload,
      }),
    },
  },
  effects: {
    async load() {
      return Promise.resolve(['1']);
    },

    async loadWithParams(a: string) {
      return Promise.resolve([a]);
    },

    loadThunk() {
      const actions = use(todoModel)[1];

      return () => {
        actions.load.fulfilled(['2']);
      };
    },
  },
}));

describe('reduck effects plugin', () => {
  test('promise middleware', async () => {
    const store = createStore({
      plugins: [plugin],
      middlewares: [logger],
    });

    const [, actions] = store.use(todoModel);

    await actions.load();

    expect(store.use(todoModel)[0]).toEqual({ items: ['1'] });
  });

  test('promise middleware params', async () => {
    const store = createStore({
      plugins: [plugin],
      middlewares: [logger],
    });

    const [, actions] = store.use(todoModel);

    await actions.loadWithParams('dddd');

    expect(store.use(todoModel)[0]).toEqual({ items: ['dddd'] });
  });

  test('thunk middleware', () => {
    const store = createStore({
      plugins: [plugin],
      middlewares: [logger],
    });

    const [, actions] = store.use(todoModel);

    actions.loadThunk();

    expect(store.use(todoModel)[0]).toEqual({ items: ['2'] });
  });
});
