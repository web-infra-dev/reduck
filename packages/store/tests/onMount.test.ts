import { createStore, model } from '../src';

const createCountModel = (onMountCreator: (onMount: any, use: any) => void) =>
  model<{ value: number }>('count').define((_, { onMount, use }) => {
    onMountCreator(onMount, use);

    return {
      state: {
        value: 1,
      },
      actions: {
        addValue(state, value) {
          return {
            ...state,
            // FIXME: ESlint 校验时，无法正确获取参数 state 的类型信息，识别为 any
            // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
            value: state.value + value,
          };
        },
      },
    };
  });

describe('test onMount hook', () => {
  test('onMount hook should invoked when model mounted', () => {
    const store = createStore();
    const fn = jest.fn();
    const onMountCreator = onMount => {
      onMount(() => {
        fn();
      });
    };
    const count = createCountModel(onMountCreator);

    store.use(count);

    expect(fn).toBeCalledTimes(1);
  });

  test('onMount hook should invoked only once when store.use model multiple times', () => {
    const store = createStore();
    const fn = jest.fn();
    const onMountCreator = onMount => {
      onMount(() => {
        fn();
      });
    };
    const count = createCountModel(onMountCreator);

    store.use(count);
    store.use(count);
    store.use(count);
    store.use(count);

    expect(fn).toBeCalledTimes(1);
  });

  test('through `use` to get newest state in onMount', () => {
    const store = createStore();
    const onMountCreator = (onMount, use) => {
      onMount(() => {
        const [state, actions] = use(count);

        expect(state).toEqual({ value: 1 });

        actions.addValue(1);

        expect(use(count)[0]).toEqual({ value: 2 });
      });
    };
    const count = createCountModel(onMountCreator);
    store.use(count);
  });

  test('actions should return correct value', () => {
    const store = createStore();
    const onMountCreator = (onMount, use) => {
      onMount(() => {
        const [, actions] = use(count);

        const result = actions.addValue(1);

        expect(result).toEqual({
          type: 'COUNT/ADDVALUE',
          payload: 1,
          extraArgs: [],
        });
      });
    };
    const count = createCountModel(onMountCreator);
    store.use(count);
  });
});
