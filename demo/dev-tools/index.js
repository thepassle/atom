import { LitElement, html, css } from "lit-element";
import { LitAtom, atom, selector } from "../../index.js";
import { Atom, Selector } from "../../src/Store.js";
import { atoms, selectors } from '../../src/core.js';

function registerDevtools() {
  window.__atoms = atoms;
  window.__selectors = selectors;
  
  const oldNotify = Atom.prototype.notify;
  Atom.prototype.notify = function() {
    document.dispatchEvent(new CustomEvent('__ATOM', {
      detail: {
        key: this.key,
        state: this.state
      }
    }));
    oldNotify.call(this);
  };
  
  requestIdleCallback(() => {
    const allAtoms = {};
    atoms.forEach((val, key) => {
      allAtoms[key] = val.state;
    });
  
    document.dispatchEvent(new CustomEvent('__ATOM_INIT', {
      detail: allAtoms
    }));
  });
}

registerDevtools();


const [count, setCount] = atom({
  key: 'count',
  default: 0,
});

const [obj, setObj] = atom({
  key: 'obj',
  default: {state: 0},
});

// const doubleCount = selector({
//   key: 'doubleCount',
//   get: ({getAtom}) => {
//     const cnt = getAtom(count);
//     return cnt * 2;
//   }
// });

// console.log(atoms);

setCount(1);
// setCount(2);

// console.log(selectors);

class Test extends LitAtom(LitElement) {
  static atoms = [count, obj];

  render() {
    return html`
      <button @click=${() => {setCount(old => old + 1)}}>click</button>
      <div>count: ${this.count}</div>
      <br>
      <br>
      <button @click=${() => {setObj(old => ({state: old.state + 1}))}}>click</button>  
      <div>obj: ${JSON.stringify(this.obj, null, 2)}</div>
      <br>
      <br>
    `
  }
}

customElements.define('my-test', Test);