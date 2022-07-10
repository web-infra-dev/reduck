import { model } from '@modern-js-reduck/store';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { useRef, useState } from 'react';
import { useModel, Provider } from '..';

interface CountState {
  value: number;
}

const countModel = model('count').define({
  state: {
    value: 1,
  },
  computed: {
    addOne: (state: CountState) => state.value + 1,
    addByParam: (state: CountState) => (val: number) => state.value + val,
  },
  actions: {
    add(state: any) {
      return {
        ...state,
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        value: state.value + 1,
      };
    },
  },
});

const userModel = model('user').define({
  state: {
    name: 'reduck',
  },
  computed: {
    withCount: [
      countModel,
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      (state: any, state2: any) => state.name + state2.value,
    ],
  },
  actions: {
    setName(state: any, name: string) {
      return {
        ...state,
        name,
      };
    },
  },
});

const countStateChange = jest.fn();
const userStateChange = jest.fn();

const App = () => {
  const ref = useRef<any>();
  const [countState, countActions] = useModel(countModel);
  const [userState, userActions] = useModel(userModel);
  if (!ref.current) {
    ref.current = {
      count: countState,
      user: userState,
    };
  } else if (ref.current.count !== countState) {
    countStateChange();
    ref.current.count = countState;
  } else if (ref.current.user !== userState) {
    userStateChange();
    ref.current.user = userState;
  }

  return (
    <>
      <div>{countState.value}</div>
      <button type="button" onClick={() => countActions.add()}>
        add
      </button>
      <div>{userState.name}</div>
      <button
        type="button"
        onClick={() =>
          userActions.setName(`${userState.name}${countState.value}`)
        }>
        change
      </button>
    </>
  );
};

const stateChange = jest.fn();

const App2 = () => {
  const ref = useRef<any>();
  const [state, actions] = useModel([countModel, userModel]);
  const [, setFoo] = useState<number>(0);

  if (!ref.current) {
    ref.current = state;
  } else if (ref.current !== state) {
    stateChange();
    ref.current = state;
  }

  return (
    <>
      <div>{state.value}</div>
      <button type="button" onClick={() => actions.add()}>
        add
      </button>
      <div>{state.name}</div>
      <button
        type="button"
        onClick={() => actions.setName(`${state.name}${state.value}`)}>
        change
      </button>
      <button
        type="button"
        onClick={() => {
          setFoo(pre => {
            return pre + 1;
          });
        }}>
        re-render
      </button>
    </>
  );
};

const App3 = () => {
  const [countState, countActions] = useModel(countModel);
  const [userState, userActions] = useModel(userModel);

  const ref = useRef<any>();

  if (!ref.current) {
    ref.current = countState;
  } else if (ref.current !== countState) {
    countStateChange();
    ref.current = countState;
  }

  const { value, addOne, addByParam } = countState;

  return (
    <>
      <div>{addOne}</div>
      <div>{addByParam(2)}</div>
      <button type="button" onClick={() => countActions.add()}>
        add
      </button>
      <div>{userState.name}</div>
      <button
        type="button"
        onClick={() => userActions.setName(`${userState.name}${value}`)}>
        change
      </button>
    </>
  );
};

const userRenderCounter = jest.fn();

const User = () => {
  const [{ name, withCount }] = useModel(userModel);

  userRenderCounter();

  return (
    <div>
      <div data-testid="username">{name}</div>
      <div data-testid="withCount">{withCount}</div>
    </div>
  );
};

describe('useModel', () => {
  test('state reference changes only when the corresponding model changes', () => {
    const result = render(
      <Provider>
        <App />
      </Provider>,
    );

    expect(result.getByText(1)).toBeInTheDocument();

    fireEvent.click(result.getByText('add'));

    expect(result.getByText(2)).toBeInTheDocument();
    expect(countStateChange).toBeCalledTimes(1);
    expect(userStateChange).toBeCalledTimes(0);

    fireEvent.click(result.getByText('change'));

    expect(result.getByText('reduck2')).toBeInTheDocument();
    expect(countStateChange).toBeCalledTimes(1);
    expect(userStateChange).toBeCalledTimes(1);

    countStateChange.mockClear();
    userStateChange.mockClear();
  });

  test('with multiple models', () => {
    const result = render(
      <Provider>
        <App2 />
      </Provider>,
    );

    fireEvent.click(result.getByText('re-render'));
    expect(stateChange).toBeCalledTimes(0);

    fireEvent.click(result.getByText('change'));
    expect(result.getByText(1)).toBeInTheDocument();
    expect(result.getByText('reduck1')).toBeInTheDocument();
    expect(stateChange).toBeCalledTimes(1);

    stateChange.mockClear();
  });

  test('computed properties', () => {
    const result = render(
      <Provider>
        <App3 />
      </Provider>,
    );

    expect(result.getByText(2)).toBeInTheDocument();
    expect(result.getByText(3)).toBeInTheDocument();
    expect(countStateChange).toBeCalledTimes(0);

    fireEvent.click(result.getByText('add'));

    expect(countStateChange).toBeCalledTimes(1);
    expect(result.getByText(3)).toBeInTheDocument();
    expect(result.getByText(4)).toBeInTheDocument();

    fireEvent.click(result.getByText('change'));

    expect(result.getByText('reduck2')).toBeInTheDocument();
    expect(countStateChange).toBeCalledTimes(1);

    countStateChange.mockClear();
  });

  test('computed property depend on other models', () => {
    render(
      <Provider>
        <App />
        <User />
      </Provider>,
    );

    expect(userRenderCounter).toBeCalledTimes(1);
    expect(screen.getByTestId('username').textContent).toEqual('reduck');
    expect(screen.getByTestId('withCount').textContent).toEqual('reduck1');

    fireEvent.click(screen.getByText('add'));
    expect(userRenderCounter).toBeCalledTimes(2);
    expect(screen.getByTestId('withCount').textContent).toEqual('reduck2');
  });

  test('state reference changes only when the corresponding model changes', () => {
    const result = render(
      <Provider>
        <App />
      </Provider>,
    );

    expect(result.getByText(1)).toBeInTheDocument();

    fireEvent.click(result.getByText('add'));

    expect(result.getByText(2)).toBeInTheDocument();
    expect(countStateChange).toBeCalledTimes(1);
    expect(userStateChange).toBeCalledTimes(0);

    fireEvent.click(result.getByText('change'));

    expect(result.getByText('reduck2')).toBeInTheDocument();
    expect(countStateChange).toBeCalledTimes(1);
    expect(userStateChange).toBeCalledTimes(1);

    countStateChange.mockClear();
    userStateChange.mockClear();
  });

  test('with multiple models', () => {
    const result = render(
      <Provider>
        <App2 />
      </Provider>,
    );

    fireEvent.click(result.getByText('re-render'));
    expect(stateChange).toBeCalledTimes(0);

    fireEvent.click(result.getByText('change'));
    expect(result.getByText(1)).toBeInTheDocument();
    expect(result.getByText('reduck1')).toBeInTheDocument();
    expect(stateChange).toBeCalledTimes(1);

    stateChange.mockClear();
  });

  test('computed properties', () => {
    const result = render(
      <Provider>
        <App3 />
      </Provider>,
    );

    expect(result.getByText(2)).toBeInTheDocument();
    expect(result.getByText(3)).toBeInTheDocument();
    expect(countStateChange).toBeCalledTimes(0);

    fireEvent.click(result.getByText('add'));

    expect(countStateChange).toBeCalledTimes(1);
    expect(result.getByText(3)).toBeInTheDocument();
    expect(result.getByText(4)).toBeInTheDocument();

    fireEvent.click(result.getByText('change'));

    expect(result.getByText('reduck2')).toBeInTheDocument();
    expect(countStateChange).toBeCalledTimes(1);

    countStateChange.mockClear();
  });

  test('computed property depend on other models', () => {
    render(
      <Provider>
        <App />
        <User />
      </Provider>,
    );

    expect(userRenderCounter).toBeCalledTimes(1);
    expect(screen.getByTestId('username').textContent).toEqual('reduck');
    expect(screen.getByTestId('withCount').textContent).toEqual('reduck1');

    fireEvent.click(screen.getByText('add'));
    expect(userRenderCounter).toBeCalledTimes(2);
    expect(screen.getByTestId('withCount').textContent).toEqual('reduck2');
  });
});
