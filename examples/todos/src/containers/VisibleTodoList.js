import { useModel } from "@modern-js-reduck/react";
import todos from "../models/todos";
import TodoList from "../components/TodoList";

const VisibleTodoList = () => {
  const [{ visibleTodos }, { toggleTodo }] = useModel(todos);

  return <TodoList todos={visibleTodos} toggleTodo={toggleTodo} />;
};

export default VisibleTodoList;

