import { createStore, model } from '@modern-js-reduck/store';
import logger from 'redux-logger';
import { plugin } from '../src';
import handleEffect from '@/utils/handleEffect';

jest.setTimeout(500000);

const sleep = async (ms: number) => {
  return new Promise<void>(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
};

const todosModel = model('todos').define({
  state: {},
  actions: {
    load: handleEffect(),
    loadNs: handleEffect({ ns: 'todos' }),
    loadNsResultAlias: handleEffect({ ns: 'todos', result: 'data' }),
    loadAlias: handleEffect({
      result: 'data',
      pending: 'loading',
      error: 'err',
    }),
    loadOmitResultNs: handleEffect({ omitResultNamespace: true }),
    loadNsAndOmitResultNs: handleEffect({
      ns: 'todos',
      omitResultNamespace: true,
    }),
    loadResultUndefined: handleEffect(),
    loadOmitPending: handleEffect({ pending: false }),
    loadOmitResult: handleEffect({ result: false }),
    loadOmitError: handleEffect({ error: false }),
    loadMergeMode: handleEffect(),
    loadMergeModeObj: handleEffect(),
    loadReplaceMode: handleEffect({ combineMode: 'replace' }),
  },
  effects: {
    async load() {
      await sleep(10);
      return ['1'];
    },
    async loadNs() {
      await sleep(10);
      return ['1'];
    },
    async loadNsResultAlias() {
      await sleep(10);
      return ['1'];
    },
    async loadAlias() {
      await sleep(10);
      return ['1'];
    },
    async loadOmitResultNs() {
      await sleep(10);
      return { items: ['1'] };
    },
    async loadNsAndOmitResultNs() {
      await sleep(10);
      return { items: ['1'] };
    },
    async loadResultUndefined() {
      await sleep(10);
    },
    async loadOmitPending() {
      await sleep(10);
      return ['1'];
    },
    async loadOmitResult() {
      await sleep(10);
      return ['1'];
    },
    async loadOmitError() {
      await sleep(10);
      return ['1'];
    },
    async loadMergeMode() {
      await sleep(10);
      return ['1'];
    },
    async loadMergeModeObj() {
      await sleep(10);
      return { todos: ['1'] };
    },
    async loadReplaceMode() {
      await sleep(10);
      return ['1'];
    },
  },
});

describe('handleEffect', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore({
      plugins: [plugin],
      middlewares: [logger],
    });
  });

  test('default config', async () => {
    const [, actions] = store.use(todosModel);

    await actions.load();

    expect(store.use(todosModel)[0]).toEqual({
      pending: false,
      result: ['1'],
      error: null,
    });
  });

  test('config `ns`', async () => {
    const [, actions] = store.use(todosModel);

    await actions.loadNs();

    expect(store.use(todosModel)[0]).toEqual({
      todos: {
        pending: false,
        result: ['1'],
        error: null,
      },
    });
  });

  test('config `ns` and `result`', async () => {
    const [, actions] = store.use(todosModel);

    await actions.loadNsResultAlias();

    expect(store.use(todosModel)[0]).toEqual({
      todos: {
        pending: false,
        data: ['1'],
        error: null,
      },
    });
  });

  test('config alias', async () => {
    const [, actions] = store.use(todosModel);

    await actions.loadAlias();

    expect(store.use(todosModel)[0]).toEqual({
      loading: false,
      data: ['1'],
      err: null,
    });
  });

  test('config `omitResultNamespace`', async () => {
    const [, actions] = store.use(todosModel);

    await actions.loadOmitResultNs();

    expect(store.use(todosModel)[0]).toEqual({
      pending: false,
      items: ['1'],
      error: null,
    });
  });

  test('config `ns` and `omitResultNamespace`', async () => {
    const [, actions] = store.use(todosModel);

    await actions.loadNsAndOmitResultNs();

    expect(store.use(todosModel)[0]).toEqual({
      todos: {
        pending: false,
        items: ['1'],
        error: null,
      },
    });
  });

  test('result is undefined', async () => {
    const [, actions] = store.use(todosModel);

    await actions.loadResultUndefined();

    expect(store.use(todosModel)[0]).toEqual({
      pending: false,
      result: null,
      error: null,
    });
  });

  test('omit pending', async () => {
    const [, actions] = store.use(todosModel);

    await actions.loadOmitPending();

    expect(store.use(todosModel)[0]).toEqual({
      result: ['1'],
      error: null,
    });
  });

  test('omit result', async () => {
    const [, actions] = store.use(todosModel);

    await actions.loadOmitResult();

    expect(store.use(todosModel)[0]).toEqual({
      pending: false,
      error: null,
    });
  });

  test('omit error', async () => {
    const [, actions] = store.use(todosModel);

    await actions.loadOmitError();

    expect(store.use(todosModel)[0]).toEqual({
      result: ['1'],
      pending: false,
    });
  });

  test('`merge` combineMode', async () => {
    const [, actions] = store.use(todosModel);

    await actions.loadMergeMode();
    await actions.loadMergeMode();

    expect(store.use(todosModel)[0]).toEqual({
      result: ['1', '1'],
      pending: false,
      error: null,
    });

    await actions.loadMergeModeObj();

    expect(store.use(todosModel)[0]).toEqual({
      result: { '0': '1', '1': '1', todos: ['1'] },
      pending: false,
      error: null,
    });
  });

  test('`replace` combineMode', async () => {
    const [, actions] = store.use(todosModel);

    await actions.loadReplaceMode();
    await actions.loadReplaceMode();

    expect(store.use(todosModel)[0]).toEqual({
      result: ['1'],
      pending: false,
      error: null,
    });
  });
});
