import { useEffect } from 'react';
import { useModel } from "@modern-js/runtime/model";
import todoModel from './model/todo';

function Todo() {
  const [state, actions] = useModel(todoModel);

  useEffect(() => {
    actions.load();
    // actions.loadWithThunk();
  }, []);

  if (state.loading) {
    return <div>loading....</div>;
  }

  return (
    <div>
      <div>
        {state.items.map((item) => (
          <div>item</div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return <Todo />
}
