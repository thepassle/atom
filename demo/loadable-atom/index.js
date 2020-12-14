import { LitElement, html, css } from 'lit-element';
import { atom, LitAtom } from '../../index.js';

const [query, setQuery] = atom({
  key: 'query',
  loadable: async (id = 1) => {
    const res = await fetch(`https://swapi.dev/api/people/${id}`);
    const body = await res.json();
    return body;
  }
});

const sleep = () => new Promise(res => setTimeout(res, 1500));

(async () => {
  await sleep();
  await setQuery(2);
  await sleep();
  await setQuery(3);
})();

class MyApp extends LitAtom(LitElement) {
  static get atoms() {
    return [query];
  }

  connectedCallback() {
    super.connectedCallback();
    setQuery();
  }

  render() {
    switch(this.query.status) {
      case 'success':
        return html`Success! ${this.query.result.name}`;
      case 'error':
        return html`error! :(`;
      case 'initialized':
      case 'pending':
      default:
        return html`Loading...`;
    }
  }
}

customElements.define('my-app', MyApp);
