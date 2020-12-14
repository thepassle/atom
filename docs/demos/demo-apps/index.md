<script type="module" src="../../components/wcd-snippet.js"></script>

# Demo apps || 7

## Simple to do app

<wcd-snippet data-id="e530K7dhKDxqpoocCOu5">

  ```js
    import { LitElement, html } from 'lit-element';
    import { LitAtom, atom, selector } from '@klaxon/atom';

    export const [todoListFilter, setTodoListFilter] = atom({
      key: 'todoListFilter',
      default: 'Show All',
    });

    export const [todoList, setTodoList] = atom({
      key: 'todoList',
      default: [
        {text: 'not done', isComplete: false, id: 0},
        {text: 'done', isComplete: true, id: 1},
      ]
    });

    const filteredTodoList = selector({
      key: 'filteredTodoList',
      get: ({getAtom}) => {
        const filter = getAtom(todoListFilter);
        const list = getAtom(todoList);

        switch (filter) {
          case 'Show Completed':
            return list.filter((item) => item.isComplete);
          case 'Show Uncompleted':
            return list.filter((item) => !item.isComplete);
          default:
            return list;
        }
      },
    });

    class TodoList extends LitAtom(LitElement) {
      static get atoms() {
        return [todoListFilter];
      }

      static get selectors() {
        return [filteredTodoList];
      }

      render() {
        return html`
          <div>
            <h1>${this.todoListFilter}</h1>
            <button @click=${() => setTodoListFilter("Show All")}>show all</button>
            <button @click=${() => setTodoListFilter("Show Completed")}>show completed</button>
            <button @click=${() => setTodoListFilter("Show Uncompleted")}>show uncompleted</button>
          </div>
          <br/>
          <div>
            <button @click=${() => setTodoList((oldTodoList) => [...oldTodoList, {text: 'New todo', isComplete: false, id: 1}])}>add</button>
          </div>
          <div>
            <ul>
              ${this.filteredTodoList?.map(todo => html`<li>${todo.text}</li>`)}
            </ul>
          </div>
        `;
      }
    }

    customElements.define('todo-app', TodoList);
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
      static get styles() {
        return css`
          :host {
            height: 100vw;
            display: flex;
          }
        `
      }
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