import createStore from './store/createStore';
import model from './model/model';
import { createPlugin } from './plugin';

export type {
  ModelDesc,
  Store,
  GetActions,
  GetState,
  ModelDescOptions,
  GetModelState,
  GetModelActions,
  Model,
} from '@/types';

export { createStore, model, createPlugin };
