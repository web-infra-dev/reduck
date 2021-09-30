type ObjectDispatchActions<T extends Record<string, any>> = {
  [key in string & keyof T as `set${Capitalize<key>}`]: (
    payload: T[key],
  ) => void;
};

const createObjectActions = (state: any) => {
  const result: Record<string, any> = {};

  Object.keys(state).forEach(key => {
    result[`set${key[0].toUpperCase()}${key.substring(1)}`] = (
      _state: any,
      payload: any,
    ) => ({
      ..._state,
      [key]: payload,
    });
  });

  return result;
};

export { createObjectActions };

export type { ObjectDispatchActions };
