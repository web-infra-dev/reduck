import { useModel, createApp } from "@modern-js/runtime/model";
import countModel from "./models/count";

const {
  Provider: LocalCounterProvider,
  useModel: useLocalCounterModel
} = createApp({});

function LocalCounter() {
  const [state, actions] = useLocalCounterModel(countModel);

  return (
    <div>
      <div>local counter: {state.value}</div>
      <button onClick={() => actions.add()}>add</button>
    </div>
  );
}


function Counter() {
  const [state, actions] = useModel(countModel);

  return (
    <div>
      <div>counter: {state.value}</div>
      <button onClick={() => actions.add()}>add</button>
    </div>
  );
}

export default function App() {
  return <LocalCounterProvider>
    <Counter />
    <LocalCounter />
  </LocalCounterProvider>;
}

