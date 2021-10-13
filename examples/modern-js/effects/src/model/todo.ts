import { model } from "@modern-js/runtime/model";

const todoModel = model("todo").define((context, { use }) => {
  return {
    state: {
      items: ["reduck"],
      loading: false,
      error: null
    },
    actions: {
      load: {
        pending(state) {
          return {
            ...state,
            loading: true
          };
        },
        fulfilled(state, items) {
          return {
            ...state,
            items,
            loading: false
          };
        },
        rejected(state, error) {
          return {
            ...state,
            error,
            loading: false
          };
        }
      }
    },
    effects: {
      async load() {
        return new Promise((resolve) => {
          setTimeout(() => resolve(["Lerna ModernJS"]), 2000);
        });
      },
      loadWithThunk() {
        const [, actions] = use(todoModel);

        return () => {
          actions.load.pending();
          new Promise((resolve) => {
            setTimeout(() => resolve(["Lerna Modern.js"]), 2000);
          })
            .then((items) => actions.load.fulfilled(items))
            .catch((e) => actions.load.rejected(e));
        };
      }
    }
  }
});

export default todoModel;
