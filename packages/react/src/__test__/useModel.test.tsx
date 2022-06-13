import { model } from '@modern-js-reduck/store';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { useModel, Provider } from '..';

const modelA = model('modelA').define({
  state: {
    a: 1,
  },
  actions: {
    incA(state) {
      return {
        a: state.a + 1,
      };
    },
  },
});
const modelB = model('modelB').define({
  state: {
    b: 10,
  },
  actions: {
    incB(state) {
      return {
        b: state.b + 1,
      };
    },
  },
});

describe('test useModel', () => {
  test('useModel with actionSelectors', () => {
    const App = () => {
      const [state, actions] = useModel(
        modelA,
        modelB,
        undefined,
        (actionsA, actionsB) => {
          return {
            ...actionsA,
            ...actionsB,
            incAB() {
              actionsA.incA();
              actionsB.incB();
            },
          };
        },
      );

      return (
        <>
          <div>{state.a}</div>
          <div>{state.b}</div>
          <button type="button" onClick={() => actions.incA()}>
            incA
          </button>
          <button type="button" onClick={() => actions.incB()}>
            incB
          </button>
          <button type="button" onClick={() => actions.incAB()}>
            incAB
          </button>
        </>
      );
    };

    const result = render(
      <Provider>
        <App />
      </Provider>,
    );

    expect(result.getByText(1)).toBeInTheDocument();
    expect(result.getByText(10)).toBeInTheDocument();

    fireEvent.click(result.getByText('incA'));
    fireEvent.click(result.getByText('incB'));
    expect(result.getByText(2)).toBeInTheDocument();
    expect(result.getByText(11)).toBeInTheDocument();
    fireEvent.click(result.getByText('incAB'));
    expect(result.getByText(3)).toBeInTheDocument();
    expect(result.getByText(12)).toBeInTheDocument();
  });
});
