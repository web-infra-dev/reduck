import { createModel } from "@reduck/core";

export const modelA = createModel("modelA").define({
  state: {
    a: 1,
  },
  actions: {
    incA(s) {
      return { a: s.a + 1 };
    },
  },
});
export const modelB = createModel("modelB").define({
  state: {
    b: 1,
  },
  actions: {
    incB(s) {
      return { b: s.b + 1 };
    },
  },
});
