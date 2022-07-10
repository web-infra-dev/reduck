/* eslint-disable @typescript-eslint/restrict-plus-operands */
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

const count2 = model('count2').define({
  state: {
    value: 1,
  },
  computed: {
    addOne: (state: any) => state.value + 1,
    sum: [count, (state: any, state2: any) => state.value + state2.value],
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
  let store: any;
  beforeEach(() => {
    store = createStore({
      plugins: [immerPlugin],
    });
  });

  test('mutable state state in action should work', () => {
    const [, actions, subscribe] = store.use(count);
    let stateUpdated = false;

    const unsubscribe = subscribe(() => {
      expect(store.use(count)[0]).toEqual({ value: 2 });
      stateUpdated = true;
    });

    actions.add();
    unsubscribe();

    expect(stateUpdated).toBe(true);
  });

  test('pure action should work', () => {
    const [, actions, subscribe] = store.use(count);
    let stateUpdated = false;

    const unsubscribe = subscribe(() => {
      expect(store.use(count)[0]).toEqual({ value: 2 });
      stateUpdated = true;
    });

    actions.pureAdd();
    unsubscribe();

    expect(stateUpdated).toBe(true);
  });

  test('computed properties should work', () => {
    const [, count1Actions] = store.use(count);
    const [, count2Actions, subscribe] = store.use(count2);

    count2Actions.pureAdd();
    const [count2State] = store.use(count2);
    expect(count2State.addOne).toEqual(3);
    expect(count2State.sum).toEqual(3);

    let stateUpdated = false;
    const unsubscribe = subscribe(() => {
      stateUpdated = true;
    });

    count1Actions.add();
    const [updateCount2State] = store.use(count2);
    expect(stateUpdated).toBe(true);
    expect(updateCount2State.addOne).toEqual(3);
    expect(updateCount2State.sum).toEqual(4);

    unsubscribe();
  });
});
/* eslint-enable @typescript-eslint/restrict-plus-operands */
