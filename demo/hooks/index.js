import { LitElement, html, css } from "lit-element";
import { registerDevtools, LitAtom, atom, selector } from "../../index.js";
import { atoms, selectors } from "../../src/core.js";
import { component, useState, useEffect } from 'haunted';

registerDevtools();

function useSelector(selector) {
  const [state, setState] = useState(null);
  
  useEffect(async () => {
    const { key } = await selector;
    const ogSelector = selectors.get(key);
    setState(ogSelector.value);

    const updateState = () => {setState(ogSelector.value)}
 
    ogSelector.addEventListener(key, updateState);
    return () => {
      ogSelector.removeEventListener(key, updateState);
    }
  }, []);

  return state;
}

function useAtom({key}) {
  const atom = atoms.get(key);
  const [state, setState] = useState(atom.state);

  const updateState = () => {setState(atoms.get(key).state)}

  useEffect(() => {
    atom.addEventListener(key, updateState);
    return () => {
      atom.removeEventListener(key, updateState);
    }
  }, []);

  return [
    state, 
    (val) => {
      const atom = atoms.get(key);
      atom.state = typeof val === 'function' ? val(atom.state) : val;
      atom.notify();
      atom.children?.forEach(child => {
        atom.dispatchEvent(new CustomEvent(child, { detail: {key: child}}))
      });
    }
  ]
}

const [countAtom] = atom({
  key: 'count',
  default: 0,
});

const doubleCount = selector({
  key: 'doubleCount',
  get: ({getAtom}) => {
    const count = getAtom(countAtom);
    return count * 2;
  }
});

function Counter() {
  const [count, setCount] = useAtom(countAtom);
  const double = useSelector(doubleCount);

  return html`
    <div id="count">${count}</div>
    <div id="count">sadf${double}</div>
    <button type="button" @click=${() => setCount(count + 1)}>
      Increment
    </button>
  `;
}

customElements.define('my-counter', component(Counter));



