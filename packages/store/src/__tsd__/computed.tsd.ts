import { expectAssignable } from 'tsd';
import { createStore, model } from '..';

type StateA = {
  a: number;
};
const modelA = model('modelA').define({
  state: {
    a: 1,
  },
  computed: {
    double(s: StateA) {
      return s.a + 1;
    },
  },
});

type StateB = {
  b: string;
};

const modelB = model('modelB').define({
  state: {
    b: '10',
  },
  computed: {
    str: [
      modelA,
      (s: StateB, other: StateA) => {
        return s.b.repeat(other.a);
      },
    ],
  },
});

describe('test selector', () => {
  const store = createStore();

  test('select state should works', () => {
    const [state] = store.use(modelA);
    expectAssignable<StateA & { double: number }>(state);
  });

  test('select actions should works', () => {
    const use = () => store.use(modelA, modelB);
    const [state] = use();
    expectAssignable<{
      a: number;
      b: string;
      double: number;
      str: string;
    }>(state);
  });
});
