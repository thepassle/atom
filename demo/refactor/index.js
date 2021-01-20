import { LitElement, html } from "lit-element";
import { LitAtom, atom, selector } from "../../index.js";

const [count, setCount] = atom({
  key: 'count',
  default: 1
});

const [query, getQuery] = atom({
  key: 'query',
  loadable: async (id = 1) => {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const body = await res.json();
    return body;
  }
});

const doubleCount = selector({
  key: 'doubleCount',
  get: ({getAtom}) => {
    const c = getAtom(count);
    return c * 2;
  }
});

const doubleCountPlusOne = selector({
  key: 'doubleCountPlusOne',
  get: async ({getSelector}) => {
    const double = await getSelector(doubleCount);
    return double + 1;
  }
});



console.log(count.getState());
setCount(2);
console.log(count.getState());


class MyEl extends LitAtom(LitElement) {
  static atoms = [count, query];
  static selectors = [doubleCount, doubleCountPlusOne]

  connectedCallback() {
    super.connectedCallback();
    getQuery();
  }

  render() {
    return html`
      <button @click=${() => setCount(old => old + 1)}>click</button>
      <button @click=${() => getQuery(2)}>loadable</button>
      <div>
        <span>[COUNT]: ${this.count}</span>
      </div>
      <div>
        <span>[QUERY]: ${this.query.result?.name}</span>
      </div>
      <div>
        <span>[DOUBLECOUNT]: ${this.doubleCount}</span>
      </div>
      <div>
        <span>[DOUBLECOUNTPLUSONE]: ${this.doubleCountPlusOne}</span>
      </div>
    `
  }
}

customElements.define('my-el', MyEl);
