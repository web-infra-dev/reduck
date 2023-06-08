import { createStore, model } from '../src';

const count1Model = model<{ value: number }>('count1').define(() => ({
  state: {
    value: 1,
  },
  actions: {
    add(state) {
      return {
        ...state,
        value: state.value + 1,
      };
    },
  },
}));

const count2Model = model<{ value: number }>('count2').define((_, { use }) => {
  use(count1Model);

  return {
    state: {
      value: 1,
    },
    actions: {
      addCount1Value(state) {
        const [{ value: count1Value }] = use(count1Model);

        return {
          ...state,
          value: state.value + count1Value,
        };
      },
    },
  };
});

const count3Model = model<{ value: number }>('count3').define(() => {
  return {
    state: {
      value: 1,
    },
    computed: {
      addOne: state => state.value + 1,
    },
  };
});

describe('test useModel', () => {
  test('actions should work', () => {
    const store = createStore();

    const [, actions] = store.use(count2Model);
    const [, count1Actions] = store.use(count1Model);

    expect(store.getState()).toEqual({
      count1: { value: 1 },
      count2: { value: 1 },
    });

    actions.addCount1Value();

    expect(store.getState()).toEqual({
      count1: { value: 1 },
      count2: { value: 2 },
    });

    count1Actions.add();

    expect(store.getState()).toEqual({
      count1: { value: 2 },
      count2: { value: 2 },
    });

    actions.addCount1Value();

    expect(store.getState()).toEqual({
      count1: { value: 2 },
      count2: { value: 4 },
    });
  });

  test('state reference is same, when passing same single model without computed properties', () => {
    const store = createStore();

    const [count1State] = store.use(count1Model);
    const [newCount1State] = store.use(count1Model);
    expect(count1State).toBe(newCount1State);
  });

  test('state reference changes, when passing multiple models', () => {
    const store = createStore();

    const [state] = store.use([count1Model, count2Model]);
    const [state2] = store.use([count1Model, count2Model]);
    expect(state).not.toBe(state2);
    expect(state).toEqual(state2);
  });

  test('state reference changes, when passing model with computed properties', () => {
    const store = createStore();

    const [count3State] = store.use(count3Model);
    const [newCount3State] = store.use(count3Model);
    expect(count3State).not.toBe(newCount3State);
    expect(count3State).toEqual(newCount3State);
  });

  test('use models with same name would be ignored', () => {
    const store = createStore();
    const countModel = model('count1').define({
      state: 2,
    });

    const [state] = store.use(count1Model, countModel);

    expect(store.getState()).toEqual({ count1: { value: 1 } });
    expect(state).toEqual({ value: 1 });
  });

  test('use self in model will get error', () => {
    const test = model('name').define((_, { use }) => {
      use(test);

      return {
        state: 1,
      };
    });

    expect(() => createStore().use(test)).toThrow(Error);
  });

  test('use multiple model with primitive state get error', () => {
    const test = model('name').define({
      state: 1,
    });

    expect(() => createStore().use(test, count1Model)).toThrow(Error);
  });
});
