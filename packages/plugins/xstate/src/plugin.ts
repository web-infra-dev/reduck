import { createPlugin } from '@modern-js-reduck/store';
import type { EventData, SCXML, SingleOrArray } from 'xstate';
import { isMachineModel } from './check';
import { ActionTypes, MachineActionPrefix, MachineStateSymbol } from './const';
import { mergeMachineMap } from './map';
import type { MachineMap } from './types';
import { getEventType } from './utils';

const machineMap: MachineMap = {};

const plugin = createPlugin(context => ({
  /** modify modelDesc */
  prepareModelDesc(modelDesc) {
    // don't change modelDesc if no 'machine' in modelDesc
    if (!isMachineModel(modelDesc)) {
      return modelDesc;
    }

    // guarantee same id between machine and modelDesc
    if (modelDesc.machine.id && modelDesc.machine.id !== modelDesc.name) {
      console.warn(
        'Unexpected machine id is not consistent with model name, it would be changed to model name',
      );
    }

    modelDesc.machine.id = modelDesc.name;

    function setAction(state: any) {
      return {
        ...state,
        [MachineStateSymbol]: '',
      };
    }

    return {
      ...modelDesc,
      state: {
        ...modelDesc.state,
      },
      actions: {
        ...modelDesc.actions,
        [MachineActionPrefix]: {
          [ActionTypes.SET]: setAction,
        },
      },
    };
  },
  modelMount({ modelDesc, mountedModel }) {
    if (!isMachineModel(modelDesc)) {
      return { modelDesc, mountedModel };
    }

    mergeMachineMap(machineMap, modelDesc);

    return { modelDesc, mountedModel } as any;
  },
  useModel(bypassParams, { mountedModels }) {
    if (mountedModels.length !== 1) {
      const hasMachineModel = mountedModels.some(mountedModel =>
        isMachineModel(mountedModel.modelDesc),
      );

      if (hasMachineModel) {
        throw new Error(
          'model.machine not support array parameter for useModel currently.',
        );
      }

      return bypassParams;
    }

    const { modelDesc } = mountedModels[0];

    // don't change modelDesc if no 'machine' in modelDesc
    if (!isMachineModel(modelDesc)) {
      return bypassParams;
    }

    const machine = machineMap[modelDesc.name];

    if (!machine) {
      throw new Error(
        `Unexpected no machine service for model <${modelDesc.name}>`,
      );
    }

    const machineState = {
      machine: {
        context: machine.service.state.context,
        meta: machine.service.state.meta,
        value: machine.service.state.value,
        state: machine.service.state,
      },
    };

    delete bypassParams.state[MachineStateSymbol];

    const state = {
      ...bypassParams.state,
      ...machineState,
    };

    const sendAction = (
      event: SingleOrArray<any> | SCXML.Event<any>,
      payload?: EventData | undefined,
    ) => {
      const sendType = getEventType(modelDesc.name, ActionTypes.SEND);
      const setType = getEventType(modelDesc.name, ActionTypes.SET);

      context.store.dispatch({
        type: sendType,
        payload: { event, payload },
      });
      const results = machine.service.send(event, payload);

      context.store.dispatch({ type: setType, payload: results });
      return results;
    };

    // remove internal machine action
    delete bypassParams.actions[MachineActionPrefix];

    const actions: Record<string, any> = {
      ...bypassParams.actions,
      send: sendAction,
    };

    return {
      ...bypassParams,
      state,
      actions,
    };
  },
}));

export default plugin;
