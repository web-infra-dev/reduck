import { expectType, expectAssignable } from 'tsd';
import { useModel } from '@modern-js/runtime/model';
import { model } from '..';
import { ReduxAction } from '@/types';

type StateManual = { count: number; name: 'a' | 'b' };
const counterManual = model<StateManual>('counter').define({
  state: { count: 1 },
  actions: {
    add(state, n: number) {
      expectType<StateManual>(state);
      return { count: state.count + n, name: 'a' };
    },
    empty(state) {
      expectType<StateManual>(state);
    },
    test: {
      a(s) {
        return s;
      },
    },
  },
});

type StateInfer = { count: number; name: string };
const counterInfer = model('counter').define({
  state: { count: 1, name: 'a' },
  actions: {
    add(state, n: number) {
      expectType<StateInfer>(state);
      return { count: state.count + n, name: 'b' };
    },
    empty(state) {
      expectType<StateInfer>(state);
    },
    test: {
      a(state) {
        expectType<StateInfer>(state);
        return state;
      },
    },
  },
});

describe('action and state manually type', () => {
  expectType<string>(counterManual.name);

  expectAssignable<(s: StateManual, n: number) => StateManual>(
    counterManual._.actions.add,
  );
  expectType<(s: StateManual) => void>(counterManual._.actions.empty);
  const [state, actions] = useModel(counterManual);
  expectType<StateManual>(state);
  expectType<(n: number) => ReduxAction<number>>(actions.add);
});

describe('action and state auto infer', () => {
  expectType<string>(counterInfer.name);
  expectType<(s: StateInfer, n: number) => StateInfer>(
    counterInfer._.actions.add,
  );
  expectType<(s: StateInfer) => void>(counterInfer._.actions.empty);
  const [state, actions] = useModel(counterInfer);
  expectType<StateInfer>(state);
  expectType<(n: number) => ReduxAction<number>>(actions.add);
});

describe('action and state union type', () => {
  const [state] = useModel(counterManual);
  expectType<'a' | 'b'>(state.name);
});

describe('action and state function Initial', () => {
  const counter = model('counter').define(() => ({
    state: { c: 1 },
    actions: {
      add(state, payload: number) {
        expectType<number>(state.c);
        return { c: state.c + payload };
      },
      test: {
        a(s) {
          return s;
        },
        b(s, p: number) {
          return { ...s, c: s.c + p };
        },
      },
    },
  }));
  const [state, actions] = useModel(counter);
  expectType<(s: { c: number }, n: number) => { c: number }>(
    counter._.actions.add,
  );
  expectType<number>(state.c);
  expectType<() => ReduxAction<undefined>>(actions.test.a);
  expectType<(n: number) => ReduxAction<number>>(actions.test.b);
});
