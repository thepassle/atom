import { LitElement, html } from 'lit-element';
import { LitAtom, atom, selector } from '../../index.js';

const [num, setNum] = atom({
  key: 'num',
  default: 1
});

const doubleNum = selector({
  key: 'doubleNum',
  get: ({getAtom}) => {
    const number = getAtom(num);
    return number * 2;
  }
});

const doubleNumPlusOne = selector({
  key: 'doubleNumPlusOne',
  get: async ({getSelector}) => {
    const doubleNumber = await getSelector(doubleNum);
    return doubleNumber + 1;
  }
});

class MyFoo extends LitAtom(LitElement) {
  static get atoms() {
    return [num];
  }
  
  static get selectors() {
    return [];
  }

  render() {
    return html`
      <button @click=${() => setNum(old => old + 1)}>increment</button>
      <div>num: ${this.num}</div>
    `
  }
}

customElements.define('my-foo', MyFoo);

class MyBar extends LitAtom(LitElement) {
  static get selectors() {
    return [doubleNum];
  }

  render() {
    return html`
      <div>doubleNum: ${this.doubleNum}</div>
    `
  }
}

customElements.define('my-bar', MyBar);

class MyBaz extends LitAtom(LitElement) {
  static get selectors() {
    return [doubleNumPlusOne];
  }

  render() {
    return html`
      <div>doubleNumPlusOne: ${this.doubleNumPlusOne}</div>
    `
  }
}

customElements.define('my-baz', MyBaz);