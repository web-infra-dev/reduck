import { useModel, createStore, Provider } from "@modern-js/runtime/model";
import countModel from "./models/count";

const store = createStore();

const [, actions] = store.use(countModel);

setInterval(() => {
  actions.add();
}, 1000)

function Counter() {
  const [state, actions] = useModel(countModel);

  return (
    <div>
      <div>counter: {state.value}</div>
    </div>
  );
}

export default function App() {
  return <Provider store={store}>
    <Counter />
  </Provider>;
}

