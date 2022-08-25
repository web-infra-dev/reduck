import { createPlugin } from '@modern-js-reduck/store';
import { produce, enableES5, enableMapSet, setAutoFreeze } from 'immer';

enableES5();
enableMapSet();
setAutoFreeze(false);

export default createPlugin(() => ({
  beforeReducer(reducer) {
    return (state: any, payload: any, ...extraArgs: any[]) =>
      produce(state, (draft: any) => reducer(draft, payload, ...extraArgs));
  },
}));
