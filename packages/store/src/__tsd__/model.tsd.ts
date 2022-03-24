/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-invalid-void-type */
import { expectType } from 'tsd';
import { useModel } from '@modern-js/runtime/model';
import { model } from '..';

describe('action and state manually type', () => {
  type State = { count: number };
  const counter = model<State>('counter').define({
    state: { count: 1 },
    actions: {
      add(state, n: number) {
        expectType<State>(state);
        return { count: state.count + n };
      },
    },
  });
  expectType<string>(counter.name);
  expectType<(s: State, n: number) => State | void>(counter._.actions.add);
  const [state, actions] = useModel(counter);
  expectType<State>(state);
  expectType<(n: number) => void>(actions.add);
});

describe('action and state auto infer', () => {
  type State = { count: number };
  const counter = model('counter').define({
    state: { count: 1 },
    actions: {
      add(state, n: number) {
        expectType<State>(state);
        return { count: state.count + n };
      },
    },
  });
  expectType<string>(counter.name);
  expectType<(s: State, n: number) => State | void>(counter._.actions.add);
  const [state, actions] = useModel(counter);
  expectType<State>(state);
  expectType<(n: number) => void>(actions.add);
});

describe('action and state union type', () => {
  type State = { type: 'a' | 'b' };
  const counter = model<State>('counter').define({
    state: { type: 'a' },
    actions: {
      add(state) {
        expectType<State>(state);
        return { type: 'b' };
      },
    },
  });
  const [state] = useModel(counter);
  expectType<'a' | 'b'>(state.type);
});

describe('action and state function Initial', () => {
  const counter = model('counter').define(() => ({
    state: { c: 1 },
    actions: {
      add(state, payload: number) {
        expectType<number>(state.c);
        return { c: state.c + payload };
      },
    },
  }));
  const [state] = useModel(counter);
  expectType<(s: { c: number }, n: number) => { c: number } | void>(
    counter._.actions.add,
  );
  expectType<number>(state.c);
});
