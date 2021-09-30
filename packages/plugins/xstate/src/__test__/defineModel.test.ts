import { createStore, model } from '@modern-js-reduck/store';
import { createMachine, plugin } from '..';

/**
 * test definition of machine model
 */
describe('define machine model', () => {
  it('defines model.machine by StateMachine and it typed correctly', () => {
    const fooModel = model('foo').define({
      state: {
        foo: 1,
      },
      machine: createMachine({
        initial: 'idle',
        states: {
          idle: {
            on: {
              WALK: 'walking',
            },
          },
          walking: {
            on: {
              STOP: 'idle',
            },
          },
        },
      }),
    });

    expect(fooModel._name).toBe('foo');
  });

  it('defines model.machine by StateMachine with machine options', () => {
    const fooModel = model('foo').define({
      state: {
        foo: 1,
      },
      machine: createMachine({
        initial: 'idle',
        context: {
          bar: 'aaa',
        },
        states: {
          idle: {
            on: {
              WALK: {
                target: 'walking',
                actions: 'waitAction',
              },
            },
          },
          walking: {
            activities: 'walkingActivity',
            on: {
              STOP: 'idle',
            },
          },
        },
      }),
      machineOptions: {
        actions: {
          waitAction: (ctx, event) => {
            expect(event.type).toBe('STOP');
          },
        },
        services: {
          walkService: (ctx, event) => () =>
            new Promise(resolve => {
              setTimeout(() => {
                expect(event.type).toBe('WALK');
                resolve('walk');
              }, 50);
            }),
        },
        activities: {
          walkingActivity: () => {
            const interval = setInterval(() => console.info('WALK!'), 1000);

            return () => clearInterval(interval);
          },
        },
      },
    });

    expect(fooModel._name).toBe('foo');
  });

  it("model.machine's id should be consistent with the model's name", () => {
    const fooModel = model('foo').define({
      state: {
        foo: 1,
      },
      machine: createMachine({
        id: 'foo',
        initial: 'idle',
        states: {
          idle: {
            on: {
              WALK: 'walking',
            },
          },
          walking: {
            on: {
              STOP: 'idle',
            },
          },
        },
      }),
    });

    expect(fooModel._name).toBe('foo');

    const spy = jest.spyOn(console, 'warn');

    const barModel = model('bar').define({
      state: {
        foo: 1,
      },
      machine: createMachine({
        id: 'qwe',
        initial: 'idle',
        states: {
          idle: {
            on: {
              WALK: 'walking',
            },
          },
          walking: {
            on: {
              STOP: 'idle',
            },
          },
        },
      }),
    });

    const store = createStore({
      plugins: [plugin],
    });

    store.use(barModel);

    expect(spy).toHaveBeenLastCalledWith(
      'Unexpected machine id is not consistent with model name, it would be changed to model name',
    );
  });

  // TODO: support override
  // it("defines model.machine by StateMachine with machine options, StateMachine's options should be overrided by model.machineOptions", () => {
  //   let finalAction: 'inner' | 'outer' = 'inner';

  //   const fooModel = model('foo').define({
  //     state: {
  //       foo: 1,
  //     },
  //     machine: createMachine(
  //       {
  //         initial: 'idle',
  //         context: {
  //           bar: 'aaa',
  //         },
  //         states: {
  //           idle: {
  //             on: {
  //               WALK: {
  //                 target: 'walking',
  //                 actions: 'waitAction',
  //               },
  //             },
  //           },
  //           walking: {
  //             activities: 'walkingActivity',
  //             on: {
  //               STOP: 'idle',
  //             },
  //           },
  //         },
  //       },
  //       {
  //         actions: {
  //           waitAction: (ctx, event) => {
  //             finalAction = 'inner';
  //             expect(event.type).toBe('WALK');
  //           },
  //         },
  //       },
  //     ),
  //     machineOptions: {
  //       actions: {
  //         waitAction: (ctx, event) => {
  //           finalAction = 'outer';
  //           expect(event.type).toBe('WALK');
  //         },
  //       },
  //       services: {
  //         walkService: (ctx, event) => () => {
  //           return new Promise(resolve => {
  //             setTimeout(() => {
  //               expect(event.type).toBe('WALK');
  //               resolve('walk');
  //             }, 50);
  //           });
  //         },
  //       },
  //       activities: {
  //         walkingActivity: () => {
  //           const interval = setInterval(() => console.log('WALK!'), 1000);

  //           return () => clearInterval(interval);
  //         },
  //       },
  //     },
  //   });

  //   expect(fooModel._name).toBe('foo');

  // const store = createStore({
  //   plugins: [plugin],
  // });

  // const [, actions] = store.use(fooModel);
  //   const results = actions.send({ type: 'WALK' });
  //   expect(results.value).toBe('walking');
  //   expect(finalAction).toBe('outer');
  // });
});
