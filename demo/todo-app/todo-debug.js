import { LitElement, html, css} from 'lit-element';
import { LitAtom, atom } from '../../index.js';
import { todos, setTodos } from './atoms/index.js';
import { todosList } from './selectors/index.js'
import { selected } from './todo-list.js';

const createTodo = id => atom({
  key: id,
  default: { id, text: "", isComplete: false },
  // trigger an update on the `todos` atom whenever a todo is created, to make sure `todos` is in sync
  effects: [todos.update]
});

const addTodo = () => {
  setTodos((old) => {
    const id = Object.keys(old).length + 1;
    return {...old, [id]: createTodo(id)}
  });
};

class TodoDebug extends LitAtom(LitElement) {
  static get styles() {
    return css`
      :host {
        flex: 1;
        padding: 20px;
        max-width: 33%;
        word-break: break-word;
      }

      pre {
        white-space: pre-wrap;
        padding: 10px;
        border-radius: 5px;
      }

      .selected {
        background-color: rgb(232, 249, 255);
      }
    `
  }

  static get atoms() {
    return [selected];
  }

  static get selectors(){
    return [todosList];
  }

  render() {
    return html`
      <button @click=${addTodo}>add todo</button>

      ${this.todosList.map(item => html`
        <pre class="${item.id === this.selected ? 'selected' : ''}">${JSON.stringify(item, null, 2)}</pre>
      `)}
    `
  }
}

customElements.define('todo-debug', TodoDebug);