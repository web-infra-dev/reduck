import { PropsWithChildren } from "react"

interface Props {
  text: string,
  completed: boolean,
  onClick: () => void
}

const Todo = ({ onClick, completed, text }: PropsWithChildren<Props>) => (
  <li
    onClick={onClick}
    style={{
      textDecoration: completed ? 'line-through' : 'none'
    }}
  >
    {text}
  </li>
)

export default Todo
