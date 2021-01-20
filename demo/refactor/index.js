import { LitElement, html, css } from "lit-element";
import { LitAtom, atom, selector } from "../../index.js";

const [count, setCount] = atom({
  key: 'count',
  default: 1
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
  static atoms = [count];
  static selectors = [doubleCount, doubleCountPlusOne]

  render() {
    console.log(this.doubleCount)
    return html`
      <div>
        <button @click=${() => setCount(old => old + 1)}>click</button>
        <span>[COUNT]: ${this.count}</span>
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
