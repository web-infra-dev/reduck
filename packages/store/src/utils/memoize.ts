export const areArgumentsShallowlyEqual = (prev: any, next: any) => {
  if (prev === next) {
    return true;
  }

  if (Array.isArray(prev) && Array.isArray(next)) {
    if (prev.length !== next.length) {
      return false;
    }
    const { length } = prev;
    for (let i = 0; i < length; i++) {
      if (prev[i] !== next[i]) {
        return false;
      }
    }
    return true;
  }

  return false;
};

const defaultMemoize = (func: (...args: any[]) => any) => {
  let lastArgs: any = null;
  let lastResult: any = null;
  return (...args: any[]) => {
    if (!areArgumentsShallowlyEqual(lastArgs, args)) {
      lastResult = func(...args);
      lastArgs = args;
    }

    return lastResult;
  };
};

export const memorize = (fn: any) => {
  return defaultMemoize(fn);
};
