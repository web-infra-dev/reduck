import { model, createStore } from '@modern-js-reduck/store';
import immerPlugin from '..';

const count = model('count').define({
  state: {
    value: 1,
  },
  actions: {
    add(state) {
      state.value += 1;
    },
    pureAdd(state) {
      return {
        ...state,
        value: state.value + 1,
      };
    },
  },
});

describe('test immer', () => {
  const store = createStore({
    plugins: [immerPlugin],
  });

  test('mutable state state in action should work', () => {
    const [, actions, subscribe] = store.use(count);
    let stateUpdated = false;

    const unsubribe = subscribe(() => {
      expect(store.use(count)[0]).toEqual({ value: 2 });
      stateUpdated = true;
    });

    actions.add();
    unsubribe();

    expect(stateUpdated).toBe(true);
  });

  test('pure action should work', () => {
    const [, actions, subscribe] = store.use(count);
    let stateUpdated = false;

    const unsubribe = subscribe(() => {
      expect(store.use(count)[0]).toEqual({ value: 3 });
      stateUpdated = true;
    });

    actions.pureAdd();
    unsubribe();

    expect(stateUpdated).toBe(true);
  });
});
