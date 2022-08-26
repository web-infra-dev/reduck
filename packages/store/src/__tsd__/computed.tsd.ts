import { expectType } from 'tsd';
import { createStore, model } from '..';

type StateA = {
  a: number;
};
const modelA = model<StateA>('modelA').define({
  state: {
    a: 1,
  },
  computed: {
    double(s) {
      return s.a + 1;
    },
  },
});

type StateB = {
  b: string;
};

const modelB = model<StateB>('modelB').define({
  state: {
    b: '10',
  },
  computed: {
    str: [
      modelA,
      (s, other: StateA) => {
        return s.b.repeat(other.a);
      },
    ],
  },
});

describe('test computed', () => {
  const store = createStore();

  test('basic usage', () => {
    const [state] = store.use(modelA);
    expectType<StateA & { double: number }>(state);
  });

  test('depend on other models', () => {
    const use = () => store.use(modelA, modelB);
    const [state] = use();
    // state.str
    expectType<StateA & StateB & { double: number } & { str: string }>(state);
  });
});
