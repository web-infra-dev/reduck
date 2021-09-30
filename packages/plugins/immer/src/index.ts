import { createPlugin } from '@modern-js-reduck/store';
import { produce } from 'immer';

export default createPlugin(() => ({
  beforeReducer(reducer) {
    return (state: any, payload: any) =>
      produce(state, (draft: any) => reducer(draft, payload));
  },
}));
