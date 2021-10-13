import { useModel } from "@modern-js/runtime/model";
import countModel from "./models/count";

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
  return <Counter />;
}

