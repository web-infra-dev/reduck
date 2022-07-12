import {useRef} from 'react'
import { useModel } from '@modern-js-reduck/react'
import todos from '../models/todos'

const AddTodo = () => {
  const [,actions] = useModel(todos);

  // won't re-render when todos state change, because the state selector always return null
  // const [,actions] = useModel(todos, (state) => null);

  const inputRef = useRef(null);

  return (
    <div>
      <form onSubmit={e => {
        e.preventDefault()
        if (!inputRef.current.value.trim()) {
          return
        }
        actions.addTodo(inputRef.current.value);
        inputRef.current.value = ''
      }}>
        <input ref= {inputRef} />
        <button type="submit">
          Add Todo
        </button>
      </form>
    </div>
  )
}

export default AddTodo
