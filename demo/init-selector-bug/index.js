import { LitElement, html, css } from "lit-element";
import { LitAtom, atom, selector } from "../../index.js";

const [count, setCount] = atom({
  key: 'count',
  default: 1,
});

const doubleCount = selector({
  key: 'doubleCount',
  get: ({getAtom}) => {
    const ogCount = getAtom(count);
    console.log('ogCount:', ogCount);
    return ogCount * 2;
  }
})
debugger;
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
  // static atoms = [count];

  render() {
    return html`
      count: ${this.count}
    `;
  }
}

customElements.define("my-atom", MyAtom);

export class MySelector extends LitAtom(LitElement) {
  static selectors = [doubleCount];

  render() {
    console.log('doubleCount:', this.doubleCount);
    return html`
      doubleCount: ${this.doubleCount}
    `;
  }
}

customElements.define("my-selector", MySelector);
