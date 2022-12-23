import { model } from '@modern-js-reduck/react';

export const modelA = model('modelA').define({
  state: {
    a: 1,
  },
  computed: {
    // add1: (state) => state.a + 1
  },
  actions: {
    incA(s) {
      return { a: s.a + 1 };
    },
  },
});
export const modelB = model('modelB').define({
  state: {
    b: 1,
  },
  computed: {
    add2: (state) => state.b + 1
  },
  actions: {
    incB(s) {
      return { b: s.b + 1 };
    },
  },
});
