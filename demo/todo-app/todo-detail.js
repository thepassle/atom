import { LitElement, html, css} from 'lit-element';
import { LitAtom, selector } from '../../index.js';
import { todos } from './atoms/index.js';
import { selected } from './todo-list.js';
import { bgCol, setBgCol } from './todo-list.js';

export const activeTodo = selector({
  key: 'activeTodo',
  get: ({getAtom}) => {
    const selectedTodo = getAtom(selected);    
    const todosList = getAtom(todos);

    if(!selectedTodo) return [];

    const [todoAtom, setTodo] = todosList[selectedTodo];
    return [todoAtom.getState(), setTodo];
  }
});

class TodoDetail extends LitAtom(LitElement) {
  static get styles() {
    return css`
      :host {
        flex: 1;
        padding: 20px;
        max-width: 33%;
        word-break: break-word;
      }
    `
  }

  static get selectors() {
    return [activeTodo];
  }

  static get atoms() {
    return [bgCol];
  }

  render() {
    const [activeTodo, setTodo] = this.activeTodo;

    return html`
      <div>
        <label for="head">background color:</label>
        <input 
          type="color" 
          id="color"
          value="${this.bgCol}"
          @input=${(e) => setBgCol(e.target.value)}
          >
        </input>
      </div>

      ${activeTodo
        ? html`
          <div>
            <h2>Todo ${activeTodo.id}</h2>
            <label for="text">Text</label>
            <div>
              <textarea 
                rows="5"
                cols="30"
                id="text" 
                .value=${activeTodo.text} 
                @input=${(e) => setTodo(old => ({...old, text: e.target.value}))}>
              </textarea>
            </div>
            <div>
              <label for="isComplete">Is done</label>
              <input 
                type="checkbox" 
                .checked=${activeTodo.isComplete} 
                @input=${(e) => {setTodo(old => ({...old, isComplete: e.target.checked}))}}>
              </input>
            </div>
          </div>
        `
        : ''
      }
    `
  }
}

customElements.define('todo-detail', TodoDetail);