import { LitElement, html, css} from 'lit-element';
import { LitAtom, atom } from '../../index.js';
import { todosList } from './selectors/index.js';

export const [selected, setSelected] = atom({
  key: 'selected',
  default: null
});

export const [bgCol, setBgCol] = atom({
  key: 'bgCol',
  default: "#d3d3d3"
});

class TodoList extends LitAtom(LitElement) {
  static get styles() {
    return css`
      :host {
        flex: 1;
        background-color: lightgrey;
        max-width: 33%;
        word-break: break-word;
      }

      ul {  
        height: 100%;
        margin: 0;
        list-style: none;
        padding: 20px;
      }

      li {
        background-color: white;
        border: solid 2px lightgrey;
        border-radius: 5px;
        padding: 20px;
        margin-bottom: 20px;
        box-shadow: 0px 2px 3px 0px rgba(50, 50, 50, 0.59);
      }

      .selected {
        border: solid 2px #0000ff;
      }

      li:hover {
        border: solid 2px #0000ff;
      }

      h2 {
        margin-top: 0;
      }

      .text {
        white-space: pre-wrap;
      }
    `
  }

  static get atoms() {
    return [selected, bgCol];
  }

  static get selectors() {
    return [todosList]
  }

  render() {
    return html`
      <ul style="background-color: ${this.bgCol}">
        ${this.todosList.map(({text, isComplete, id}) => html`
          <li class="${this.selected === id ? 'selected' : ''}" @click=${() => {setSelected(id)}}>
            <h2>Todo ${id}</h2>
            <div class="text">${text}</div>
            <div>done: ${isComplete}</div>
          </li>
        `)}
      </ul>
    `
  }
}

customElements.define('todo-list', TodoList);