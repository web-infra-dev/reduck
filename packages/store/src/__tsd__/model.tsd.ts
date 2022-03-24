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
        return { c: state.c + payload };
      },
    },
  }));
  const [state] = useModel(counter);
  expectType<number>(state.c);
});
