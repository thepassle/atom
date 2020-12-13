import { LitElement, html, css} from 'lit-element';
import { LitAtom } from '../../index.js';
import './todo-debug.js';
import './todo-list.js';
import './todo-detail.js';

class TodoApp extends LitAtom(LitElement) {
  static get styles() {
    return css`
      :host {
        height: 100%;
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