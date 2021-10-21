import { model } from '@modern-js-reduck/store';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import {
  useModel,
  Provider,
  createApp,
  useStaticModel,
  useLocalModel,
} from '..';

const countModel = model('name').define({
  state: {
    value: 1,
  },
  actions: {
    add(state) {
      return {
        ...state,
        value: state.value + 1,
      };
    },
  },
});

const App = () => {
  const [state, actions] = useModel(countModel);

  return (
    <>
      <div>{state.value}</div>
      <button type="button" onClick={() => actions.add()}>
        add
      </button>
    </>
  );
};

describe('test createApp', () => {
  test('createApp should return Provider and useModel', () => {
    const { Provider: _Provider, useModel: _useModel } = createApp({});

    expect(_Provider).toBeTruthy();
    expect(_useModel).toBeTruthy();
  });

  test('Global Provider and useModel should work', () => {
    const result = render(
      <Provider>
        <App />
      </Provider>,
    );

    expect(result.getByText(1)).toBeInTheDocument();

    fireEvent.click(result.getByText('add'));

    expect(result.getByText(2)).toBeInTheDocument();
  });

  test('Local Provider and useModel should work', () => {
    const { Provider: LocalProvider, useModel: useLModel } = createApp({});

    const SubApp = () => {
      const [state, actions] = useLModel(countModel);

      return (
        <>
          <div>{state.value}</div>
          <button type="button" onClick={() => actions.add()}>
            add
          </button>
        </>
      );
    };

    const result = render(
      <LocalProvider>
        <SubApp />
      </LocalProvider>,
    );

    expect(result.getByText(1)).toBeInTheDocument();

    fireEvent.click(result.getByText('add'));

    expect(result.getByText(2)).toBeInTheDocument();
  });

  test('useStaticModel should work', () => {
    let renderTime = 0;
    let currentCount = 0;

    const StaticApp = () => {
      renderTime += 1;

      const [state, actions] = useStaticModel(countModel);

      currentCount = state.value;

      return (
        <>
          <div>{state.value}</div>
          <button type="button" onClick={() => actions.add()}>
            add
          </button>
          <button
            type="button"
            onClick={() => {
              currentCount = state.value;
            }}>
            updateCount
          </button>
        </>
      );
    };

    const result = render(
      <Provider>
        <StaticApp />
      </Provider>,
    );

    expect(renderTime).toBe(1);
    expect(currentCount).toBe(1);

    fireEvent.click(result.getByText('add'));

    expect(renderTime).toBe(1);
    expect(currentCount).toBe(1);

    fireEvent.click(result.getByText('updateCount'));
    expect(currentCount).toBe(2);
  });

  test('useLocalModel should work', () => {
    function Container() {
      const [state, actions] = useLocalModel(countModel);
      const [state1, actions1] = useLocalModel(countModel);

      return (
        <div>
          <div>state: {state.value}</div>
          <div>state1: {state1.value}</div>
          <button type="button" onClick={() => actions.add()}>
            actions add
          </button>
          <button type="button" onClick={() => actions1.add()}>
            actions1 add
          </button>
        </div>
      );
    }

    const result = render(<Container />);

    fireEvent.click(result.getByText('actions add'));
    expect(result.getByText('state: 2')).toBeInTheDocument();
    expect(result.getByText('state1: 1')).toBeInTheDocument();

    fireEvent.click(result.getByText('actions1 add'));
    expect(result.getByText('state: 2')).toBeInTheDocument();
    expect(result.getByText('state1: 2')).toBeInTheDocument();
  });
});
