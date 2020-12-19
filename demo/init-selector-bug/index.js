import { LitElement, html, css } from "lit-element";
import { LitAtom, atom, selector } from "../../index.js";

const [count, setCount] = atom({
  key: 'count',
  default: 1,
});

const doubleCount = selector({
  key: 'doubleCount',
  get: ({getAtom}) => {
    console.log('### 👍 [DOUBLE]')
    const ogCount = getAtom(count);
    return ogCount * 2;
  }
});

const doubleCountPlusTen = selector({
  key: 'doubleCountPlusTen',
  get: async ({getSelector}) => {
    console.log('### 👍 [PLUS TEN]')
    const double = await getSelector(doubleCount);
    return double + 10;
  }
});

export class MyApp extends LitElement {
  render() {
    return html`
      <my-atom></my-atom>
      <my-selector></my-selector>
    `
  }
}
customElements.define('my-app', MyApp)

export class MyAtom extends LitAtom(LitElement) {
  static atoms = [count];

  render() {
    return html`
      count: ${this.count}
    `;
  }
}

customElements.define("my-atom", MyAtom);

export class MySelector extends LitAtom(LitElement) {
  static selectors = [doubleCountPlusTen];

  render() {
    return html`
    <div>
      doubleCountPlusTen: ${this.doubleCountPlusTen}
    </div>
    <button @click=${()=>{setCount(old => old + 1)}}>click</button>
    `;
  }
}

customElements.define("my-selector", MySelector);
