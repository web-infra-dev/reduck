import { model } from '@modern-js-reduck/store';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { useModel, Provider } from '..';

const countModel = model('name').define({
  state: {
    value: 1,
    value1: 1,
  },
  actions: {
    addValue(state) {
      return {
        ...state,
        value: state.value + 1,
      };
    },
    addValue1(state) {
      return {
        ...state,
        value1: state.value1 + 1,
      };
    },
  },
});

describe('test batch', () => {
  test('once store change, update should batch in one render', () => {
    let renderCount = 0;

    function SubApp() {
      renderCount += 1;

      const [{ value1 }, { addValue1 }] = useModel(countModel);

      return (
        <>
          <div>value1:{value1}</div>
          <div
            onClick={() => {
              addValue1();
            }}>
            addValue1
          </div>
        </>
      );
    }

    function App() {
      const [{ value }, { addValue }] = useModel(countModel);
      return (
        <div>
          <div>value:{value}</div>
          <div onClick={() => addValue()}>addValue</div>
          <SubApp />
        </div>
      );
    }

    const result = render(
      <Provider>
        <App />
      </Provider>,
    );

    expect(renderCount).toBe(1);
    fireEvent.click(result.getByText('addValue'));
    expect(renderCount).toBe(2);
    expect(result.getByText('value:2')).toBeInTheDocument();

    fireEvent.click(result.getByText('addValue1'));
    expect(renderCount).toBe(3);
    expect(result.getByText('value1:2')).toBeInTheDocument();
  });

  test('state selector should reduce the rerender times', () => {
    let parentRenderCount = 0;
    let childRenderCount = 0;

    function SubApp() {
      childRenderCount += 1;

      const [{ value1 }, { addValue1 }] = useModel(countModel, state => ({
        value1: state.value1,
      }));

      return (
        <>
          <div>value1:{value1}</div>
          <div
            onClick={() => {
              addValue1();
            }}>
            addValue1
          </div>
        </>
      );
    }

    function App() {
      parentRenderCount += 1;
      const [{ value }, { addValue }] = useModel(countModel, state => ({
        value: state.value,
      }));

      return (
        <div>
          <div>value:{value}</div>
          <div onClick={() => addValue()}>addValue</div>
          <SubApp />
        </div>
      );
    }

    const result = render(
      <Provider>
        <App />
      </Provider>,
    );

    expect(parentRenderCount).toBe(1);
    expect(childRenderCount).toBe(1);

    fireEvent.click(result.getByText('addValue'));
    expect(parentRenderCount).toBe(2);
    expect(childRenderCount).toBe(2);

    fireEvent.click(result.getByText('addValue1'));
    expect(parentRenderCount).toBe(2);
    expect(childRenderCount).toBe(3);

    expect(result.getByText('value:2')).toBeInTheDocument();
    expect(result.getByText('value1:2')).toBeInTheDocument();
  });
});
