/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { ComponentType, NamedExoticComponent } from 'react';
import { forwardRef, memo } from 'react';
import { isModel } from '@modern-js-reduck/store/utils';

import type {
  Model,
  GetModelActions,
  GetModelState,
} from '@modern-js-reduck/store';
// @ts-expect-error
import hoistNonReactStatics from 'hoist-non-react-statics';
import { useModel } from './hook';

export type Shared<InjectedProps, DecorationTargetProps> = {
  [P in Extract<
    keyof InjectedProps,
    keyof DecorationTargetProps
  >]?: InjectedProps[P] extends DecorationTargetProps[P]
    ? DecorationTargetProps[P]
    : never;
};

export type ConnectedComponent<
  C extends ComponentType<any>,
  P,
> = NamedExoticComponent<JSX.LibraryManagedAttributes<C, P>>;

// FIXME: hoistNonReactStatics type is complex
// > = NamedExoticComponent<JSX.LibraryManagedAttributes<C, P>> &
//   hoistNonReactStatics.NonReactStatics<C> & {
//     WrappedComponent: C;
//   };

// Infers prop type from component C
export type GetProps<C> = C extends ComponentType<infer P> ? P : never;

export type Matching<InjectedProps, DecorationTargetProps> = {
  [P in keyof DecorationTargetProps]: P extends keyof InjectedProps
    ? InjectedProps[P] extends DecorationTargetProps[P]
      ? DecorationTargetProps[P]
      : InjectedProps[P]
    : DecorationTargetProps[P];
};
export type InferableComponentEnhancerWithProps<TInjectedProps, TNeedsProps> = <
  C extends ComponentType<Matching<TInjectedProps, GetProps<C>>>,
>(
  component: C,
) => ConnectedComponent<
  C,
  Omit<GetProps<C>, keyof Shared<TInjectedProps, GetProps<C>>> & TNeedsProps
>;
// type Model = any

type SelectActionsToProps4<S1, S2, S3, S4, OwnProps, ActionsToProps> = (
  s1: S1,
  s2: S2,
  s3: S3,
  s4: S4,
  ownProps: OwnProps,
) => ActionsToProps;
type SelectActionsToProps3<S1, S2, S3, OwnProps, ActionsToProps> = (
  s1: S1,
  s2: S2,
  s3: S3,
  ownProps: OwnProps,
) => ActionsToProps;
type SelectActionsToProps2<S1, S2, OwnProps, ActionsToProps> = (
  s1: S1,
  s2: S2,
  ownProps: OwnProps,
) => ActionsToProps;
type SelectActionsToProps1<S1, OwnProps, ActionsToProps> = (
  s1: S1,
  ownProps: OwnProps,
) => ActionsToProps;

type SelectStateToProps4<S1, S2, S3, S4, OwnProps, StateToProps> = (
  s1: S1,
  s2: S2,
  s3: S3,
  s4: S4,
  ownProps: OwnProps,
) => StateToProps;
type SelectStateToProps3<S1, S2, S3, OwnProps, StateToProps> = (
  s1: S1,
  s2: S2,
  s3: S3,
  ownProps: OwnProps,
) => StateToProps;
type SelectStateToProps2<S1, S2, OwnProps, StateToProps> = (
  s1: S1,
  s2: S2,
  ownProps: OwnProps,
) => StateToProps;
type SelectStateToProps1<S1, OwnProps, StateToProps> = (
  s1: S1,
  ownProps: OwnProps,
) => StateToProps;

export interface ConnectOptions {
  forwardRef?: boolean;
}

// overload-test
/* only models --- start */
export function connect<OwnProps = {}, M1 extends Model = Model>(
  m1: [M1] | M1,
  opt?: ConnectOptions,
): InferableComponentEnhancerWithProps<
  GetModelState<M1> & GetModelActions<M1>,
  OwnProps
>;

export function connect<
  OwnProps = {},
  M1 extends Model = Model,
  M2 extends Model = Model,
>(
  models: [M1, M2],
  opt?: ConnectOptions,
): InferableComponentEnhancerWithProps<
  GetModelActions<M1> &
    GetModelActions<M2> &
    GetModelState<M1> &
    GetModelState<M2>,
  OwnProps
>;

export function connect<
  OwnProps = {},
  M1 extends Model = Model,
  M2 extends Model = Model,
  M3 extends Model = Model,
>(
  models: [M1, M2, M3],
  opt?: ConnectOptions,
): InferableComponentEnhancerWithProps<
  GetModelActions<M1> &
    GetModelActions<M2> &
    GetModelState<M3> & {
      actions: GetModelState<M1> & GetModelState<M2> & GetModelActions<M3>;
    },
  OwnProps
>;

export function connect<
  OwnProps = {},
  M1 extends Model = Model,
  M2 extends Model = Model,
  M3 extends Model = Model,
  M4 extends Model = Model,
>(
  models: [M1, M2, M3, M4],
  opt?: ConnectOptions,
): InferableComponentEnhancerWithProps<
  GetModelActions<M1> &
    GetModelActions<M2> &
    GetModelState<M3> &
    GetModelState<M4> & {
      actions: GetModelState<M1> &
        GetModelState<M2> &
        GetModelActions<M3> &
        GetModelActions<M4>;
    },
  OwnProps
>;
// NOTICE: 为了支持 connect([...models])
export function connect<OwnProps = {}>(
  models: Model[],
  opt?: ConnectOptions,
): InferableComponentEnhancerWithProps<any, OwnProps>;

/* only models --- end */

/* models and selector --- start */
export function connect<
  OwnProps = {},
  M1 extends Model = Model,
  StateToProps = {},
>(
  models: [
    M1,
    SelectStateToProps1<GetModelActions<M1>, OwnProps, StateToProps>,
  ],
  opt?: ConnectOptions,
): InferableComponentEnhancerWithProps<
  StateToProps & GetModelState<M1>,
  OwnProps
>;

export function connect<
  OwnProps = {},
  M1 extends Model = Model,
  StateToProps = {},
  ActionsToProps = {},
>(
  models: [
    M1,
    SelectStateToProps1<GetModelState<M1>, OwnProps, StateToProps>,
    SelectActionsToProps1<GetModelActions<M1>, OwnProps, ActionsToProps>,
  ],
  opt?: ConnectOptions,
): InferableComponentEnhancerWithProps<StateToProps & ActionsToProps, OwnProps>;

export function connect<
  OwnProps = {},
  M1 extends Model = Model,
  M2 extends Model = Model,
  StateToProps = {},
>(
  models: [
    M1,
    M2,
    SelectStateToProps2<
      GetModelActions<M1>,
      GetModelActions<M2>,
      OwnProps,
      StateToProps
    >,
  ],
  opt?: ConnectOptions,
): InferableComponentEnhancerWithProps<
  StateToProps & GetModelState<M1> & GetModelState<M2>,
  OwnProps
>;

export function connect<
  OwnProps = {},
  M1 extends Model = Model,
  M2 extends Model = Model,
  StateToProps = {},
  ActionsToProps = {},
>(
  models: [
    M1,
    M2,
    SelectStateToProps2<
      GetModelState<M1>,
      GetModelState<M2>,
      OwnProps,
      StateToProps
    >,
    SelectActionsToProps2<
      GetModelActions<M1>,
      GetModelActions<M2>,
      OwnProps,
      ActionsToProps
    >,
  ],
  opt?: ConnectOptions,
): InferableComponentEnhancerWithProps<StateToProps & ActionsToProps, OwnProps>;

export function connect<
  OwnProps = {},
  M1 extends Model = Model,
  M2 extends Model = Model,
  M3 extends Model = Model,
  StateToProps = {},
>(
  models: [
    M1,
    M2,
    M3,
    SelectStateToProps3<
      GetModelActions<M1>,
      GetModelActions<M2>,
      GetModelState<M3>,
      OwnProps,
      StateToProps
    >,
  ],
  opt?: ConnectOptions,
): InferableComponentEnhancerWithProps<
  StateToProps & {
    actions: GetModelState<M1> & GetModelState<M2> & GetModelActions<M3>;
  },
  OwnProps
>;

export function connect<
  OwnProps = {},
  M1 extends Model = Model,
  M2 extends Model = Model,
  M3 extends Model = Model,
  StateToProps = {},
  ActionsToProps = {},
>(
  models: [
    M1,
    M2,
    M3,
    SelectStateToProps3<
      GetModelActions<M1>,
      GetModelActions<M2>,
      GetModelState<M3>,
      OwnProps,
      StateToProps
    >,
    SelectActionsToProps3<
      GetModelState<M1>,
      GetModelState<M2>,
      GetModelActions<M3>,
      OwnProps,
      ActionsToProps
    >,
  ],
  opt?: ConnectOptions,
): InferableComponentEnhancerWithProps<StateToProps & ActionsToProps, OwnProps>;

export function connect<
  OwnProps = {},
  M1 extends Model = Model,
  M2 extends Model = Model,
  M3 extends Model = Model,
  M4 extends Model = Model,
  StateToProps = {},
>(
  models: [
    M1,
    M2,
    M3,
    M4,
    SelectStateToProps4<
      GetModelActions<M1>,
      GetModelActions<M2>,
      GetModelState<M3>,
      GetModelState<M4>,
      OwnProps,
      StateToProps
    >,
  ],
  opt?: ConnectOptions,
): InferableComponentEnhancerWithProps<
  StateToProps & {
    actions: GetModelState<M1> &
      GetModelState<M2> &
      GetModelActions<M3> &
      GetModelActions<M4>;
  },
  OwnProps
>;

export function connect<
  OwnProps = {},
  M1 extends Model = Model,
  M2 extends Model = Model,
  M3 extends Model = Model,
  M4 extends Model = Model,
  StateToProps = {},
  ActionsToProps = {},
>(
  models: [
    M1,
    M2,
    M3,
    M4,
    SelectStateToProps4<
      GetModelActions<M1>,
      GetModelActions<M2>,
      GetModelState<M3>,
      GetModelState<M4>,
      OwnProps,
      StateToProps
    >,
    SelectActionsToProps4<
      GetModelState<M1>,
      GetModelState<M2>,
      GetModelActions<M3>,
      GetModelActions<M4>,
      OwnProps,
      ActionsToProps
    >,
  ],
  opt?: ConnectOptions,
): InferableComponentEnhancerWithProps<StateToProps & ActionsToProps, OwnProps>;
/* models and selector --- end */

export function connect(models: any, opt?: ConnectOptions) {
  return (<P extends object>(C: ComponentType<P>) =>
    withProxy(C, models, opt)) as any;
}

function withProxy<P extends object, S extends object, A extends object>(
  C: any,
  models: any,
  opt?: ConnectOptions,
) {
  const actualModels: Model[] = [];
  const selectors: any[] = [];
  const modelArr = Array.isArray(models) ? models : [models];

  for (const model of modelArr) {
    if (isModel(model)) {
      actualModels.push(model);
    } else {
      selectors.push(model);
    }
  }

  const config: ConnectOptions = {};
  if (opt && typeof opt === 'object' && Object.keys(opt).length > 0) {
    Object.assign(config, opt);
  }

  const Wrapper = (props: Omit<P, keyof (S & A)>, ref: any) => {
    const [stateSelector, actionSelector] = selectors;

    let finalStateSelector;
    let finalActionSelector;
    if (stateSelector) {
      finalStateSelector = (..._args: any[]) => stateSelector(..._args, props);
    }
    if (actionSelector) {
      finalActionSelector =
        actionSelector &&
        ((..._args: any[]) => actionSelector(..._args, props));
    }

    const [mapState, mapActions] = useModel([
      ...actualModels,
      // FIXME: any
      finalStateSelector as any,
      finalActionSelector,
    ]);
    const data = {
      ...mapState,
      ...mapActions,
      ...props,
    };
    if (ref && config.forwardRef) {
      data.ref = ref;
    }
    return <C {...data} />;
  };

  Wrapper.displayName = `Connect(${C.displayName || C.name || 'Anonymous'})}`;

  hoistNonReactStatics(Wrapper, C);
  if (config.forwardRef) {
    return forwardRef(Wrapper);
  }
  return memo(Wrapper);
}

export type GetConnectType<T> = T extends InferableComponentEnhancerWithProps<
  infer R,
  infer P
>
  ? R & P
  : never;
