import Todo from './Todo'
import todos from '../models/todos'
import type {Todo as TTodo} from '../models/todos'
import { GetModelActions } from '@modern-js-reduck/react'
import { PropsWithChildren } from 'react'

interface Props {
  todos: TTodo[],
  toggleTodo: GetModelActions<typeof todos>['toggleTodo']
}

const TodoList = ({ todos, toggleTodo }: PropsWithChildren<Props>) => (
  <ul>
    {todos.map(todo =>
      <Todo
        key={todo.id}
        {...todo}
        onClick={() => toggleTodo(todo.id)}
      />
    )}
  </ul>
)

export default TodoList
