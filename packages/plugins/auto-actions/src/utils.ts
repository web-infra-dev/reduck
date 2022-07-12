import { ModelDesc } from '@modern-js-reduck/store/dist/types';

const mergeActions = (modelDesc: ModelDesc, actions: any) => ({
  ...modelDesc,
  actions: {
    ...actions,
    ...modelDesc.actions,
  },
});

export { mergeActions };
