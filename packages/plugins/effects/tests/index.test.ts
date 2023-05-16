import { createStore, model } from '@modern-js-reduck/store';
import logger from 'redux-logger';
import { plugin } from '../src';

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

    async boolRetEffect() {
      return Promise.resolve(false);
    },

    loadThunk() {
      const actions = use(todoModel)[1];

      // cannot get `dispatch` and `getState` params, thunk effect not work correctlly
      // maybe we could only support promise effect?
      return () => {
        actions.load.fulfilled(['2']);
      };
    },

    voidEffect() {
      // do some effect thing, for example: localStorage.setItem('hello', 'reduck');
      return 'success';
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

    const res = await actions.load();

    expect(res).toEqual(['1']);
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

  test('void effect', () => {
    const store = createStore({
      plugins: [plugin],
      middlewares: [logger],
    });

    const [, actions] = store.use(todoModel);

    const res = actions.voidEffect();

    expect(res).toEqual('success');
  });

  test('promise effect return bool', async () => {
    const store = createStore({
      plugins: [plugin],
      middlewares: [logger],
    });

    const [, actions] = store.use(todoModel);

    const res = await actions.boolRetEffect();

    expect(res).toEqual(false);
  });
});
