// import { LitElement, html, css } from "lit-element";
import { atom, selector } from "../../index.js";

const [state, setState] = atom({
  key: 'state',
  default: 1
});

console.log(state.getState());
setState(2);
console.log(state.getState());
