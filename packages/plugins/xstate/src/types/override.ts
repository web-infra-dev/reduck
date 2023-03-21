import { Model } from '@modern-js-reduck/store/types';
import { Interpreter } from 'xstate/lib/interpreter';
import {
  StateMachine,
  EventObject,
  MachineConfig,
  MachineOptions,
} from 'xstate/lib/types';

/**
 * override types of `reduck/core`'s states, actions
 */
declare module '@modern-js-reduck/store' {
  // Add `machine` type when use model({machine}).
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ModelDesc<State = any, MDO extends ModelDescOptions = any> {
    machine?:
      | StateMachine<
          MDO['machine'] extends { context: any }
            ? MDO['machine']['context']
            : any,
          any,
          MDO['machine'] extends { event: any } ? MDO['machine']['event'] : any
        >
      | MachineConfig<
          MDO['machine'] extends { context: any }
            ? MDO['machine']['context']
            : any,
          any,
          MDO['machine'] extends { event: any } ? MDO['machine']['event'] : any
        >;
    machineOptions?: Partial<
      MachineOptions<
        MDO['machine'] extends { context: any }
          ? MDO['machine']['context']
          : any,
        MDO['machine'] extends { event: any } ? MDO['machine']['event'] : any
      >
    >;
  }

  interface ModelDescOptions {
    machine?: {
      context?: any;
      event?: EventObject;
    };
  }

  interface GetState<M extends Model> {
    machineState: {
      /**
       * choose context, meta, value of Interpreter State and whole State
       */
      machine: M['_']['machine'] extends StateMachine<
        infer TContext,
        infer TStateSchema,
        infer TEvent
      > // analyse StateMachine and MachineConfig
        ? Pick<
            Interpreter<TContext, TStateSchema, TEvent>['state'],
            'context' | 'meta' | 'value'
          > & {
            state: Interpreter<TContext, TStateSchema, TEvent>['state'];
          }
        : M['_']['machine'] extends MachineConfig<
            infer TContext,
            any,
            infer TEvent
          >
        ? Pick<
            Interpreter<TContext, any, TEvent>['state'],
            'context' | 'meta' | 'value'
          > & {
            state: Interpreter<TContext, any, TEvent>['state'];
          }
        : StateMachine<any, any, any>;
    };
  }

  interface GetActions<M extends Model> {
    machineActions: {
      /** machine send function */
      send: M['_']['machine'] extends StateMachine<
        infer TContext,
        infer TStateSchema,
        infer TEvent
      > // analyse StateMachine and MachineConfig
        ? Interpreter<TContext, TStateSchema, TEvent>['send']
        : M['_']['machine'] extends MachineConfig<
            infer TContext,
            any,
            infer TEvent
          >
        ? Interpreter<TContext, any, TEvent>['send']
        : (event: any) => void;
    };
  }
}
