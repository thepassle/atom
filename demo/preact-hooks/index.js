import { render } from 'preact';
import { html } from 'htm/preact';
import { atom, selector } from "../../index.js";
import { useAtom, useSelector } from '../../integrations/preact.js';

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

function App() {
  const [count, setCount] = useAtom(countAtom);
  const double = useSelector(doubleCount);

  return html`
    <div id="count">${count}</div>
    <div id="double">${double}</div>
    <button type="button" onClick=${() => setCount(count + 1)}>
      Increment
    </button>
  `
};

render(html`<${App} /><${App} />`, document.body);
