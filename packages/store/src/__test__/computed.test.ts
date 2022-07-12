import { model, createStore } from '..';

interface State {
  value: number;
}

const addOneCounter = jest.fn();
const addByParamCounter = jest.fn();
const sumCounter = jest.fn();
const sumWithExtraCounter = jest.fn();

const countModel = model<State>('counter').define({
  state: {
    value: 1,
  },
  computed: {
    addOne: (state: State) => {
      addOneCounter();
      return state.value + 1;
    },
    addByParam: (state: State) => (val: number) => {
      addByParamCounter();
      return state.value + val;
    },
  },
  actions: {
    add(state) {
      return {
        ...state,
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        value: state.value + 1,
      };
    },
  },
});

const count2Model = model<State>('counter2').define({
  state: {
    value: 1,
    data: 2,
  },
  computed: {
    sum: [
      countModel,
      (self: State, state: State) => {
        sumCounter();
        return self.value + state.value;
      },
    ],
    sumWithExtra: [
      countModel,
      (self: State, state: State) => {
        return (extra: number) => {
          sumWithExtraCounter();
          return self.value + state.value + extra;
        };
      },
    ],
  },
  actions: {
    add(state) {
      return {
        ...state,
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        value: state.value + 1,
      };
    },
  },
});

describe('test model computed properties', () => {
  let store;

  beforeEach(() => {
    store = createStore();
  });

  afterEach(() => {
    addOneCounter.mockClear();
    addByParamCounter.mockClear();
    sumCounter.mockClear();
    sumWithExtraCounter.mockClear();
  });

  test('only depend on self state', () => {
    store.use(countModel);
    const {
      counter: { addOne },
    } = store.getState();
    expect(addOne).toEqual(2);
  });

  test('with extra params', () => {
    store.use(countModel);
    const {
      counter: { addByParam },
    } = store.getState();
    expect(addByParam(1)).toEqual(2);
  });

  test('array structure', () => {
    store.use(countModel, count2Model);
    const { counter2 } = store.getState();
    expect(counter2.sum).toEqual(2);
    expect(counter2.sumWithExtra(1)).toEqual(3);

    const [, actions] = store.use(countModel);
    actions.add();

    const { counter2: newCounter2 } = store.getState();
    expect(newCounter2.sum).toEqual(3);
    expect(newCounter2.sumWithExtra(1)).toEqual(4);
  });

  test('cache works when computed property is value type', () => {
    const [counter, action] = store.use(countModel);
    const [newCounter] = store.use(countModel);

    expect(counter.addOne).toBe(newCounter.addOne);
    expect(addOneCounter).toBeCalledTimes(1);

    action.add();

    const { counter: updateCounter } = store.getState(countModel);

    // call getter
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    updateCounter.addOne;
    expect(addOneCounter).toBeCalledTimes(2);
  });

  test('cache works when computed property is function type', () => {
    const [counter, action] = store.use(countModel);

    const [newCounter] = store.use(countModel);

    expect(counter.addByParam).toBe(newCounter.addByParam);
    expect(addByParamCounter).toBeCalledTimes(0);

    // computed function won't be re-called when params are same.
    counter.addByParam(1);
    counter.addByParam(1);
    expect(addByParamCounter).toBeCalledTimes(1);

    // computed function would be re-called when params change
    counter.addByParam(2);
    expect(addByParamCounter).toBeCalledTimes(2);

    action.add();

    const [updateCounter] = store.use(countModel);
    expect(updateCounter).not.toBe(newCounter);
    expect(updateCounter.addByParam).not.toBe(newCounter.addByParam);
  });

  test('cache works when computed property has dependent models', () => {
    const [counter2] = store.use(count2Model);
    const [newCounter2] = store.use(count2Model);

    // state reference changes every time getting from store.use(),
    // but it's property value is same if the original state in store didn't change
    expect(counter2).not.toBe(newCounter2);
    expect(counter2.sum).toBe(newCounter2.sum);
    expect(sumCounter).toBeCalledTimes(1);
    expect(counter2.sumWithExtra).toBe(newCounter2.sumWithExtra);

    counter2.sumWithExtra(1);
    counter2.sumWithExtra(1);
    expect(sumWithExtraCounter).toBeCalledTimes(1);

    const [, action] = store.use(countModel);
    action.add();

    const [updateCounter2] = store.use(count2Model);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    updateCounter2.sum;

    expect(sumCounter).toBeCalledTimes(2);
    expect(counter2.sum).not.toBe(updateCounter2.sum);
    expect(counter2).not.toBe(updateCounter2);
    expect(counter2.sumWithExtra).not.toBe(updateCounter2.sumWithExtra);

    counter2.sumWithExtra(1);
    counter2.sumWithExtra(1);
    expect(sumWithExtraCounter).toBeCalledTimes(1);
  });
});
