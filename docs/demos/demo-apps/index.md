<script type="module" src="../../components/wcd-snippet.js"></script>

# Demo apps || 7

## Simple to do app

<wcd-snippet data-id="pBCtxnMHtLGtLN7poFo4">

  ```js
    import { LitElement, html, css } from "lit-element";
    import { LitAtom, atom, selector } from "@klaxon/atom";

    const [todos, setTodos] = atom({
      key: 'todos',
      default: [{id: Date.now(), text: 'todo', isComplete: false}]
    });

    const [filter, setFilter] = atom({
      key: 'filter',
      default: 'all'
    });

    const filteredTodos = selector({
      key: 'filteredTodos',
      get: ({getAtom}) => {
        const todoList = getAtom(todos);
        const todoFilter = getAtom(filter);

        switch(todoFilter) {
          case 'active':
            return todoList.filter(todo => !todo.isComplete);
          case 'completed':
            return todoList.filter(todo => todo.isComplete);
          case 'all':
            return todoList;
        }
      }
    });


    const addTodo = e => {
      e.preventDefault();
      setTodos(old => [
        ...old,
        {
          id: Date.now(),
          text: e.target.elements.todo.value,
          isComplete: false
        }
      ])
    }

    export class TodoApp extends LitAtom(LitElement) {
      static atoms = [todos, filter];
      static selectors = [filteredTodos];

      render() {
        return html`
          <h1>todos</h1>
          
          <form @submit=${addTodo}>
            <input name="todo" placeholder="What needs to be done?"/>
            <button type="submit">submit</button>
          </form>

          <ul>
            ${this.filteredTodos?.map(({text, isComplete, id}) => html`
              <li>
                <input 
                  type="checkbox" 
                  .checked=${isComplete} 
                  @change=${() => setTodos(old => old.map(todo => todo.id === id ? {...todo, isComplete: true} : todo))} 
                />
                <p>${text}</p>
                <button @click=${() => setTodos(old => old.filter(todo => todo.id !== id))}>❌</button>
              </li>
            `)}
          </ul>

          <div>
            <p>${this.filteredTodos?.length} items</p>
            <div>
              <button @click=${() => setFilter('all')}>all</button>
              <button @click=${() => setFilter('active')}>active</button>
              <button @click=${() => setFilter('completed')}>completed</button>
            </div>
          </div>
        `;
      }
    }

    customElements.define("todo-app", TodoApp);

  ```

</wcd-snippet>

## Advanced to do app

<wcd-snippet data-id="A80qn3Jw65cvZPT8gp4Q">

  ```js
    import { LitElement, html, css} from 'lit-element';
    import './todo-debug.js';
    import './todo-list.js';
    import './todo-detail.js';

    class TodoApp extends LitElement {
      render() {
        return html`
          <todo-debug></todo-debug>
          <todo-list></todo-list>
          <todo-detail></todo-detail>
        `
      }
    }

    customElements.define('todo-app', TodoApp);
  ```

</wcd-snippet>