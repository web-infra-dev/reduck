import { model } from '@modern-js-reduck/store';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { useModel, Provider, createApp, useStaticModel } from '..';

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

  test('Global Provider and useModel should works', () => {
    const result = render(
      <Provider>
        <App />
      </Provider>,
    );

    expect(result.getByText(1)).toBeInTheDocument();

    fireEvent.click(result.getByText('add'));

    expect(result.getByText(2)).toBeInTheDocument();
  });

  test('Local Provider and useModel should works', () => {
    const { Provider: LocalProvider, useModel: useLocalModel } = createApp({});

    const SubApp = () => {
      const [state, actions] = useLocalModel(countModel);

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
});
