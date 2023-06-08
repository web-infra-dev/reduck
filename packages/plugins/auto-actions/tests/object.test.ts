import { createStore, model } from '@modern-js-reduck/store';
import plugin from '../src';

const testModel = model('name').define({
  state: {
    a: 1,
    b: '1',
    c: { a: '1' },
  },
});

const store = createStore({
  plugins: [plugin],
});

const [, { setA, setB, setC }] = store.use(testModel);

const expectState = (key: 'a' | 'b' | 'c', state: any) => {
  expect(store.use(testModel)[0][key]).toEqual(state);
};

describe('test object auto actions', () => {
  it('setA', () => {
    setA(2);
    expectState('a', 2);
  });

  it('setB', () => {
    setB('1234');
    expectState('b', '1234');
  });

  it('setC', () => {
    setC({ a: '666' });
    expectState('c', { a: '666' });
  });
});
