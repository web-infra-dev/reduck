/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { render, fireEvent } from '@testing-library/react';
import { GetModelActions, model } from '@modern-js-reduck/store';
import '@testing-library/jest-dom/extend-expect';
import { useRef, forwardRef } from 'react';
import { Provider, connect, GetConnectType } from '..';

const modelA = model('modelA').define({
  state: {
    a: 1,
  },
  actions: {
    incA(state) {
      return {
        ...state,
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
        ...state,
        b: state.b + 1,
      };
    },
  },
});
describe('test connect', () => {
  test('connect should work with single model', () => {
    const modelConnect = connect([modelA]);
    type ConnectProps = GetConnectType<typeof modelConnect>;
    type OwnProps = {
      title: string;
    };
    type Props = OwnProps & ConnectProps;
    const App = modelConnect((props: Props) => {
      return (
        <>
          <div>{props.title}</div>
          <div>{props.a}</div>
          <button type="button" onClick={() => props.incA()}>
            incA
          </button>
        </>
      );
    });
    const result = render(
      <Provider>
        <App title={'app'} />
      </Provider>,
    );

    expect(result.getByText(1)).toBeInTheDocument();

    fireEvent.click(result.getByText('incA'));
    expect(result.getByText(2)).toBeInTheDocument();
  });
  test('connect should work with single model and mapState/mapActions', () => {
    const modelConnect = connect([
      modelA,
      state => {
        return {
          ...state,
          double: state.a * 2,
        };
      },
      actions => {
        return {
          ...actions,
          incDouble() {
            actions.incA();
            actions.incA();
          },
        };
      },
    ]);
    type ConnectProps = GetConnectType<typeof modelConnect>;
    type OwnProps = {
      title: string;
    };
    type Props = OwnProps & ConnectProps;
    const App = modelConnect((props: Props) => {
      return (
        <>
          <div>{props.title}</div>
          <div>{props.a}</div>
          <div>{props.double}</div>
          <button type="button" onClick={() => props.incA()}>
            incA
          </button>
          <button type="button" onClick={() => props.incDouble()}>
            incDouble
          </button>
        </>
      );
    });
    const result = render(
      <Provider>
        <App title={'app'} />
      </Provider>,
    );

    expect(result.getByText(1)).toBeInTheDocument();
    expect(result.getByText(2)).toBeInTheDocument();

    fireEvent.click(result.getByText('incA'));
    expect(result.getByText(2)).toBeInTheDocument();
    expect(result.getByText(4)).toBeInTheDocument();
    fireEvent.click(result.getByText('incDouble'));
    expect(result.getByText(4)).toBeInTheDocument();
    expect(result.getByText(8)).toBeInTheDocument();
  });
  test('connect should work with multi model', () => {
    const modelConnect = connect([
      modelA,
      modelB,
      (stateA, stateB) => {
        return { ...stateA, ...stateB, ab: stateA.a + stateB.b };
      },
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
    ]);
    type ConnectProps = GetConnectType<typeof modelConnect>;
    type OwnProps = {
      title: string;
    };
    type Props = OwnProps & ConnectProps;
    const App = modelConnect((props: Props) => {
      return (
        <>
          <div>{props.title}</div>
          <div>{props.a}</div>
          <div>{props.b}</div>
          <div>{props.ab}</div>
          <button type="button" onClick={() => props.incA()}>
            incA
          </button>
          <button type="button" onClick={() => props.incB()}>
            incB
          </button>
          <button type="button" onClick={() => props.incAB()}>
            incAB
          </button>
        </>
      );
    });
    const result = render(
      <Provider>
        <App title={'app'} />
      </Provider>,
    );

    expect(result.getByText(1)).toBeInTheDocument();
    expect(result.getByText(10)).toBeInTheDocument();
    expect(result.getByText(11)).toBeInTheDocument();

    fireEvent.click(result.getByText('incA'));
    expect(result.getByText(2)).toBeInTheDocument();
    expect(result.getByText(10)).toBeInTheDocument();
    expect(result.getByText(12)).toBeInTheDocument();

    fireEvent.click(result.getByText('incB'));
    expect(result.getByText(2)).toBeInTheDocument();
    expect(result.getByText(11)).toBeInTheDocument();
    expect(result.getByText(13)).toBeInTheDocument();

    fireEvent.click(result.getByText('incAB'));
    expect(result.getByText(3)).toBeInTheDocument();
    expect(result.getByText(12)).toBeInTheDocument();
    expect(result.getByText(15)).toBeInTheDocument();
  });

  test('connect with ref should work', () => {
    const modelConnect = connect([modelA], {
      forwardRef: true,
    });
    type Props = GetConnectType<typeof modelConnect>;
    const Counter = modelConnect(
      forwardRef((props: Props, ref: any) => {
        return (
          <div>
            <div>{props.a}</div>
            <div ref={ref}>a</div>;
          </div>
        );
      }),
    );
    const App = () => {
      const ref = useRef<any>();
      return (
        <div>
          <Counter ref={ref} />
          <button
            onClick={() => {
              ref.current.innerHTML = 'b';
            }}
          >
            click
          </button>
        </div>
      );
    };
    const result = render(
      <Provider>
        <App />
      </Provider>,
    );

    expect(result.getByText('a')).toBeInTheDocument();
    fireEvent.click(result.getByText('click'));
    expect(result.getByText('b')).toBeInTheDocument();
  });

  test('connect with static props should work', () => {
    const Component = () => {
      return null;
    };
    Component.foo = 'bar';
    const Wrapper = connect([modelA])(Component);
    // FIXME: infer static props
    expect((Wrapper as any).foo).toEqual('bar');
  });

  test('connect should work with Component props', () => {
    const modelConnect = connect([
      modelA,
      modelB,
      // FIXME: any
      (stateA, stateB, props: any) => {
        // FIXME: stateA stateB 推导为 any
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        return { c: stateA.a + stateB.b + props.value };
      },
      (
        // FIXME: 类型推导失败
        actionsA: GetModelActions<typeof modelA>,
        actionsB: GetModelActions<typeof modelB>,
      ) => {
        return {
          incAB() {
            actionsA.incA();
            actionsB.incB();
          },
        };
      },
    ]);

    type ConnectProps = GetConnectType<typeof modelConnect>;
    type OwnProps = {
      value: number;
    };
    type Props = OwnProps & ConnectProps;
    const App = modelConnect((props: Props) => {
      return (
        <>
          <div>{props.value}</div>
          <div>{props.c}</div>
          <button type="button" onClick={() => props.incAB()}>
            incAB
          </button>
        </>
      );
    });

    const result = render(
      <Provider>
        <App value={1} />
      </Provider>,
    );

    expect(result.getByText(1)).toBeInTheDocument();
    expect(result.getByText(12)).toBeInTheDocument();

    fireEvent.click(result.getByText('incAB'));
    expect(result.getByText(14)).toBeInTheDocument();
  });
});
