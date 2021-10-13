import { model } from '@modern-js/runtime/model';

const stepModel = model('step').define({
  state: 1
});

const counterModel = model('count').define((context, { use, onMount }) => {
  const [,,subsribeStep] = use(stepModel);

  onMount(() => {
    return subsribeStep(() => {
      console.log(`Subsribe in counterModel: stepModel change to ${use(stepModel)[0]}`)
    });
  });

  return {
    state: {
      value: 1
    },
    actions: {
      add(state) {
        const step = use(stepModel)[0]

        return {
          ...state,
          value: state.value + step
        };
      }
    }
  }
});

export { stepModel, counterModel };
