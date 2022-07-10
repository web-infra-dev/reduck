import { model } from "@modern-js-reduck/store"

export const VisibilityFilters = {
  SHOW_ALL: 'SHOW_ALL',
  SHOW_COMPLETED: 'SHOW_COMPLETED',
  SHOW_ACTIVE: 'SHOW_ACTIVE'
}

let nextTodoId = 0

const todos = model('todos').define({
  state: {
    data: [],
    visibilityFilter: VisibilityFilters.SHOW_ALL
  },
  computed: {
    visibleTodos: (state) => {
      const {data, visibilityFilter} = state
      switch (visibilityFilter) {
        case VisibilityFilters.SHOW_ALL:
          return data;
        case VisibilityFilters.SHOW_COMPLETED:
          return data.filter(t => t.completed);
        case VisibilityFilters.SHOW_ACTIVE:
          return data.filter(t => !t.completed);
        default:
          throw new Error('Unknown filter: ' + visibilityFilter)
      }
    },
    completedTodoCount: (state) => state.data.reduce((count, todo) => todo.completed ? count + 1: count, 0)
  },
  actions: {
    addTodo: (state, text) => {
      state.data.push({id: nextTodoId++, text, completed: false})
    },
    toggleTodo: (state, id) => {
      state.data.forEach(todo => todo.id === id ? todo.completed = !todo.completed : todo)
    },
    setVisibilityFilter: (state, filter) => {
      state.visibilityFilter = filter ;
    }
  }
})

export default todos;

