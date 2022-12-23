import { useModel } from '@modern-js-reduck/react';
import { modelA, modelB } from './model/count';
function App() {
  const [state, actions] = useModel(modelA, modelB);

  return (
    <div>
      <h3>a: {state.a}</h3>
      <h3>b: {state.b}</h3>
      <button onClick={actions.incA}>incA</button>
      <button onClick={actions.incB}>incB</button>
    </div>
  );
}

export default App;
