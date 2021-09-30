import { ModelDesc } from '@modern-js-reduck/store/dist/types';

type DataType = 'primitive' | 'array' | 'object';

const getType = (value: any): DataType => {
  switch (Object.prototype.toString.call(value)) {
    case '[object Object]':
      return 'object';
    case '[object Array]':
      return 'array';
    default:
      return 'primitive';
  }
};

const mergeActions = (modelDesc: ModelDesc, actions: any) => ({
  ...modelDesc,
  actions: {
    ...actions,
    ...modelDesc.actions,
  },
});

export { getType, mergeActions };
