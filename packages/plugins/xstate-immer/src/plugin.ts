import { createPlugin } from '@modern-js-reduck/store';
import { isMachineModel } from '@modern-js-reduck/plugin-xstate';
import { assign } from '@xstate/immer';

export const plugin = createPlugin(() => ({
  prepareModelDesc(modelDesc) {
    if (!isMachineModel(modelDesc)) {
      return modelDesc;
    }

    const path: string[] = [];

    // FIXME:
    traverse((modelDesc.machine as any).config.states);

    return modelDesc;

    /**
     * traverse for immerifing actions
     */
    function traverse(obj: any) {
      Object.keys(obj).forEach(key => {
        path.push(key);
        const realPath = path.join('/');

        const isOnActions = /\/on\/\S+\/actions$/.exec(realPath);

        if (typeof obj[key] === 'string') {
          path.pop();
          return;
        }

        const isFunction = typeof obj[key] === 'function';
        const isAssignObj =
          Object.keys(obj[key]) === ['type', 'assignment'] &&
          obj[key].type === 'xstate.assign';
        if (isOnActions && isFunction) {
          obj[key] = assign(obj[key]);
        } else if (isAssignObj) {
          obj[key] = assign(obj[key].assignment);
        } else {
          traverse(obj[key]);
        }
        path.pop();
      });
    }
  },
}));
