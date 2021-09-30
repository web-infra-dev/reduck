import { createModel } from 'xstate/lib/model';
import { createStore, model } from '@modern-js-reduck/store';
import { plugin as XStatePlugin } from '@modern-js-reduck/plugin-xstate';
import { assign } from '@xstate/immer';
import { plugin } from '..';

describe('test inline actions', () => {
  test('could transform raw assign object inline actions', () => {
    const fooRawModel = createModel(
      {
        counter: 0,
      },
      {
        events: {
          WALK: () => ({}),
          IDLE: (value: any) => ({ value }),
        },
      },
    );

    const fooModel = model('foo').define(() => ({
      state: {
        foo: 'qwe',
      },
      machine: fooRawModel.createMachine({
        initial: 'red',
        states: {
          red: {
            on: {
              IDLE: {
                target: 'blue',
                actions: ctx => {
                  ctx.counter += 1;
                },
              },
            },
          },
          blue: {
            on: {
              WALK: 'red',
            },
          },
        },
      }),
    }));
    const store = createStore({
      plugins: [plugin, XStatePlugin],
    });

    let [state, actions] = store.use(fooModel);
    expect(state.machine.context.counter).toEqual(0);
    actions.send('IDLE');
    [state, actions] = store.use(fooModel);
    expect(state.machine.context.counter).toEqual(1);
  });

  test('could transform raw assign array inline actions', () => {
    const fooRawModel = createModel(
      {
        counter: 0,
      },
      {
        events: {
          WALK: () => ({}),
          IDLE: (value: any) => ({ value }),
        },
      },
    );
    const fooModel = model('foo2').define(() => ({
      state: {
        foo: 'qwe',
      },
      machine: fooRawModel.createMachine({
        initial: 'red',
        states: {
          red: {
            on: {
              IDLE: {
                target: 'blue',
                actions: [
                  ctx => {
                    ctx.counter += 1;
                  },
                ],
              },
            },
          },
          blue: {
            on: {
              WALK: 'red',
            },
          },
        },
      }),
    }));
    const store = createStore({
      plugins: [plugin, XStatePlugin],
    });

    let [state, actions] = store.use(fooModel);
    expect(state.machine.context.counter).toEqual(0);
    actions.send('IDLE');
    [state, actions] = store.use(fooModel);
    expect(state.machine.context.counter).toEqual(1);
  });

  test('could transform raw assign array inline actions by return assignment', () => {
    const fooRawModel = createModel(
      {
        counter: 0,
      },
      {
        events: {
          WALK: () => ({}),
          IDLE: (value: any) => ({ value }),
        },
      },
    );
    const machine = fooRawModel.createMachine({
      initial: 'red',
      states: {
        red: {
          on: {
            IDLE: {
              target: 'blue',
              actions: ctx => {
                ctx.counter += 1;
              },
            },
          },
        },
        blue: {
          on: {
            WALK: 'red',
          },
        },
      },
    });
    const fooModel = model('foo3').define(() => ({
      state: {
        foo: 'qwe',
      },
      machine,
    }));
    const store = createStore({
      plugins: [plugin, XStatePlugin],
    });

    let [state, actions] = store.use(fooModel);
    expect(state.machine.context.counter).toEqual(0);
    actions.send('IDLE');
    [state, actions] = store.use(fooModel);
    expect(state.machine.context.counter).toEqual(1);
  });

  // TODO: support return assignment
  // test('could transform raw assign array inline actions by return assignment', () => {
  //   const fooRawModel = createModel(
  //     {
  //       counter: 0,
  //     },
  //     {
  //       events: {
  //         WALK: () => {
  //           return {};
  //         },
  //         IDLE: (value: any) => {
  //           return { value };
  //         },
  //       },
  //     },
  //   );
  //   const machine = fooRawModel.createMachine({
  //     initial: 'red',
  //     states: {
  //       red: {
  //         on: {
  //           IDLE: {
  //             target: 'blue',
  //             actions: ctx => {
  //               return {
  //                 ...ctx,
  //                 counter: ctx.counter + 1,
  //               };
  //             },
  //           },
  //         },
  //       },
  //       blue: {
  //         on: {
  //           WALK: 'red',
  //         },
  //       },
  //     },
  //   });
  //   const fooModel = model('foo4').define(() => {
  //     return {
  //       state: {
  //         foo: 'qwe',
  //       },
  //       machine,
  //     };
  //   });
  //   const store = createStore({
  //     plugins: [plugin, XStatePlugin],
  //   });

  //   let [state, actions] = store.use(fooModel);
  //   expect(state.machine.context.counter).toEqual(0);
  //   actions.send('IDLE');
  //   [state, actions] = store.use(fooModel);
  //   expect(state.machine.context.counter).toEqual(1);
  // });

  test('could transform raw assign inline actions with array', () => {
    const fooRawModel = createModel(
      {
        counter: 0,
      },
      {
        events: {
          WALK: () => ({}),
          IDLE: (value: any) => ({ value }),
        },
      },
    );
    const machine = fooRawModel.createMachine({
      initial: 'red',
      states: {
        red: {
          on: {
            IDLE: {
              target: 'blue',
              actions: ctx => {
                ctx.counter += 1;
              },
            },
          },
        },
        blue: {
          on: {
            WALK: 'red',
          },
        },
      },
    });
    const fooModel = model('foo4').define(() => ({
      state: {
        foo: 'qwe',
      },
      machine,
    }));
    const store = createStore({
      plugins: [plugin, XStatePlugin],
    });

    let [state, actions] = store.use(fooModel);
    expect(state.machine.context.counter).toEqual(0);
    actions.send('IDLE');
    [state, actions] = store.use(fooModel);
    expect(state.machine.context.counter).toEqual(1);
  });

  test('could transform xstate assign actions', () => {
    const fooRawModel = createModel(
      {
        counter: 0,
      },
      {
        events: {
          WALK: () => ({}),
          IDLE: (value: any) => ({ value }),
        },
      },
    );
    const machine = fooRawModel.createMachine({
      initial: 'red',
      states: {
        red: {
          on: {
            IDLE: {
              target: 'blue',
              actions: assign(ctx => {
                ctx.counter += 1;
              }),
            },
          },
        },
        blue: {
          on: {
            WALK: 'red',
          },
        },
      },
    });
    const fooModel = model('foo5').define(() => ({
      state: {
        foo: 'qwe',
      },
      machine,
    }));
    const store = createStore({
      plugins: [plugin, XStatePlugin],
    });

    let [state, actions] = store.use(fooModel);
    expect(state.machine.context.counter).toEqual(0);
    actions.send('IDLE');
    [state, actions] = store.use(fooModel);
    expect(state.machine.context.counter).toEqual(1);
  });
});
