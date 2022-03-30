const push = <T extends any[]>(state: T, payload: T[0]) =>
  state.concat(payload);

const pop = <T extends any[]>(state: T) => {
  const newState = [];

  for (let i = 0; i < state.length - 1; i++) {
    newState.push(state[i]);
  }

  return newState;
};

const shift = <T extends any[]>(state: T) => {
  const newState = [];

  for (let i = 1; i < state.length; i++) {
    newState.push(state[i]);
  }

  return newState;
};

const unshift = <T extends any[]>(state: T, payload: T[0]) => [
  payload,
  ...state,
];

const concat = <T extends any[]>(state: T, payload: T) => [
  ...state,
  ...payload,
];

const splice = <T extends any[]>(
  state: T,
  start: number,
  deleteCount: number,
  ...items: T
) => {
  const newState = state.slice();
  newState.splice(start, deleteCount, ...items);

  return newState;
};

const filter = <T extends any[]>(
  state: T,
  filterFn: (value: T[0], index: number, array: T[0][]) => boolean,
) => {
  const newState = state.filter(filterFn);

  return newState;
};

type ArrayDispatchActions<T extends any[]> = {
  push: (payload: T[0]) => void;
  pop: () => void;
  shift: () => void;
  unshift: (payload: T[0]) => void;
  concat: (payload: T) => void;
  splice: (start: number, deleteCount: number, ...items: T) => void;
  filter: (
    filterFn: (value: T[0], index: number, array: T[0][]) => boolean,
  ) => void;
};

export { push, pop, shift, unshift, concat, splice, filter };
export type { ArrayDispatchActions };
