type StateName = 'result' | 'pending' | 'error';

interface Config {
  ns?: string;
  result?: string | false;
  error?: string | false;
  pending?: string | false;
  combineMode?: 'merge' | 'replace';
  omitResultNamespace?: boolean;
}

const isObject = (obj: any) => {
  return (
    typeof obj === 'object' &&
    Object.prototype.toString.call(obj) === '[object Object]'
  );
};

const isNullable = (obj: any) => {
  return obj === null || typeof obj === 'undefined';
};

const objectSet = (
  obj: Record<any, unknown>,
  paths: string | string[],
  value: unknown,
  isImmutable = false,
) => {
  const result = isImmutable ? { ...obj } : obj;

  let _paths = paths;
  if (typeof _paths === 'string') {
    _paths = _paths.split('.');
  }

  const tailObj = _paths.slice(0, -1).reduce((acc: any, pathItem: string) => {
    if (typeof acc[pathItem] === 'undefined') {
      acc[pathItem] = Object.create(null);
    } else if (isImmutable) {
      acc[pathItem] = { ...acc[pathItem] };
    }
    return acc[pathItem];
  }, result);

  tailObj[_paths.slice(-1)[0]] = value;
  return result;
};

const objectGet = (obj: Record<any, any>, paths: string | string[]) => {
  let _paths = paths;
  if (typeof _paths === 'string') {
    _paths = _paths.split('.');
  }

  const len = _paths.length;
  let result = obj;

  for (let i = 0; i < len; i++) {
    result = result[_paths[i]];

    if (result == null) {
      return result;
    } else if (i !== len - 1 && !isObject(result)) {
      throw new Error(
        `get the value on the corresponding path of the ${JSON.stringify(
          obj,
        )} error`,
      );
    }
  }

  return result;
};

export default function handleEffect<
  State = any,
  Payload = any,
  Error = string,
>(
  config: Config = {},
): {
  pending: (state: State) => State | void;
  fulfilled: (state: State, payload: Payload) => State | void;
  rejected: (state: State, error: Error) => State | void;
} {
  const {
    ns,
    result = 'result',
    pending = 'pending',
    error = 'error',
    combineMode = 'merge',
    omitResultNamespace = false,
  } = config;

  const generateStateName = (name: string | false) => {
    if (name === false) {
      return null;
    }
    return ns ? `${ns}.${name}` : name;
  };

  const stateNamesMap: Record<StateName, string | null> = {
    result: generateStateName(result),
    pending: generateStateName(pending),
    error: generateStateName(error),
  };

  const getCurrentResult = (state: any) => {
    if (!stateNamesMap.result) {
      return null;
    }

    const result = objectGet(state, stateNamesMap.result);
    return typeof result !== 'undefined' ? result : null;
  };

  const changeResult = (currentResult: any, newResult?: any) => {
    // Mark: don't update result if newResult is undefined
    if (typeof newResult === 'undefined') {
      return currentResult;
    }

    switch (combineMode) {
      case 'replace':
        return newResult;
      case 'merge': {
        if (Array.isArray(newResult)) {
          // eslint-disable-next-line no-nested-ternary
          return Array.isArray(currentResult)
            ? [...currentResult, ...newResult]
            : isNullable(currentResult)
            ? [...newResult]
            : [currentResult, ...newResult];
        } else if (isObject(newResult)) {
          return {
            ...currentResult,
            ...newResult,
          };
        } else {
          return newResult;
        }
      }
      default:
        return newResult;
    }
  };

  const getReducer = (getChange: any) => {
    return (state: any, payload: any) => {
      const resultChange = getChange(state, payload);

      return (Object.keys(stateNamesMap) as StateName[]).reduce(
        (preState, stateKey) => {
          const result = resultChange[stateKey];

          const stateName = stateNamesMap[stateKey];
          if (stateName !== null) {
            if (stateKey === 'result' && omitResultNamespace === true) {
              return ns
                ? { ...preState, ...{ [ns]: { ...preState[ns], ...result } } }
                : { ...preState, ...result };
            }
            return objectSet(preState, stateName, result, true);
          } else {
            return preState;
          }
        },
        state,
      );
    };
  };

  const autoReducerMap: any = {};

  stateNamesMap.pending &&
    (autoReducerMap.pending = getReducer((state: any) => ({
      pending: true,
      error: null,
      result: getCurrentResult(state),
    })));

  (stateNamesMap.pending || stateNamesMap.result) &&
    (autoReducerMap.fulfilled = getReducer((state: any, payload: any) => {
      return {
        pending: false,
        error: null,
        result: changeResult(getCurrentResult(state), payload),
      };
    }));

  (stateNamesMap.pending || stateNamesMap.error) &&
    (autoReducerMap.rejected = getReducer(
      (state: any, payload: any = 'async action rejected') => {
        return {
          pending: false,
          error: payload,
          result: getCurrentResult(state),
        };
      },
    ));

  return autoReducerMap;
}
