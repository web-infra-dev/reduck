import { createStore, model } from '@modern-js-reduck/store';
import plugin from '../src';

const testModel = model('name').define({
  state: 0,
});

const testModel1 = model('name1').define({
  state: 0,
  actions: {
    setState(_state, payload: number) {
      return payload + 1;
    },
  },
});

const store = createStore({
  plugins: [plugin],
});

describe('test primitive auto actions', () => {
  it('state is a number, setState action should work', () => {
    const [, actions] = store.use(testModel);

    actions.setState(2);
    expect(store.use(testModel)[0]).toBe(2);
  });

  it("user's action priority is higher than auto actions", () => {
    const [, actions] = store.use(testModel1);

    actions.setState(2);
    expect(store.use(testModel1)[0]).toBe(3);
  });
});
