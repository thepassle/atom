// import { LitElement, html, css } from "lit-element";
import { atom, selector } from "../../index.js";

const [count, setCount] = atom({
  key: 'count',
  default: 1
});

const foo = selector({
  key: 'doubleCount',
  get: ({getAtom}) => {
    const c = getAtom(count);
    return c * 2;
  }
});

console.log(count.getState());
setCount(2);
console.log(count.getState());
