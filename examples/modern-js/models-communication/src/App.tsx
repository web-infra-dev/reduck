import { useModel } from "@modern-js/runtime/model";
import { counterModel, stepModel } from "./models/count";

function Counter() {
  const [state, actions] = useModel(counterModel);
  const [step, stepActions] = useModel(stepModel);

  return (
    <div>
      <div>step: {step}</div>
      <button onClick={() => stepActions.setState(step + 1)}>add step</button>
      <div>counter: {state.value}</div>
      <button onClick={() => actions.add()}>add counter</button>
    </div>
  );
}

export default function App() {
  return <Counter />;
}

