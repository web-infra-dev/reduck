import { createStore, model } from '@modern-js-reduck/store';
import plugin from '../src';

const testModel = model('name').define({
  state: [1, 2, 3],
});

const store = createStore({
  plugins: [plugin],
});

const [, actions] = store.use(testModel);

const expectState = (state: any) => {
  expect(store.use(testModel)[0]).toEqual(state);
};

describe('test array auto actions', () => {
  test('push', () => {
    actions.push(4);

    expectState([1, 2, 3, 4]);
  });

  test('pop', () => {
    actions.pop();
    expectState([1, 2, 3]);
  });

  test('shift', () => {
    actions.shift();
    expectState([2, 3]);
  });

  test('unshift', () => {
    actions.unshift(1);
    expectState([1, 2, 3]);
  });

  test('concat', () => {
    actions.concat([4, 5]);
    expectState([1, 2, 3, 4, 5]);
  });

  test('splice', () => {
    actions.splice(0, 2);
    expectState([3, 4, 5]);

    actions.splice(0, 0, 1, 2);
    expectState([1, 2, 3, 4, 5]);
  });

  test('filter', () => {
    actions.filter(value => value <= 2);
    expectState([1, 2]);

    actions.push(3);
    expectState([1, 2, 3]);
  });
});
