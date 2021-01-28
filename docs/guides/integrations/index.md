# Integrations || 2

`@klaxon/atom` is framework agnostic, and can be implemented for usage with your favourite library or framework. There are currently integrations available for usage with [LitElement](https://lit-element.polymer-project.org/), [Haunted](https://github.com/matthewp/haunted), and [Preact](https://preactjs.com/).

## LitElement

You can import the `LitAtom` Mixin, and add any Atoms or Selectors to your component through the `static atoms`/`static selectors` field. This will then make the Atoms and Selectors available on your component instance, based on the `key` provided to the atom. Example:

```js
import { LitElement, html } from 'lit-element';
import { LitAtom, atom, selector } from '@klaxon/atom';

const [count] = atom({
  key: 'count', // The key will be available on your component instance
  default: 1
});

const doubleCount = selector({
  key: 'doubleCount', // The key will be available on your component instance
  get: ({getAtom}) => {
    const originalCount = getAtom(count);
    return originalCount * 2;
  }
});

class MyElement extends LitAtom(LitElement) {
  static atoms = [count];
  static selectors = [doubleCount];

  render() {
    return html`
      <div>${this.count}</div>
      <div>${this.doubleCount}</div>
    `;
  }
}
```

## Haunted

There are also Hooks available for usage with Haunted, or [Preact](#Preact).

```js
import { component } from 'haunted';
import { html } from 'lit-html';
import { atom, selector } from '@klaxon/atom';
import { useAtom, useSelector } from '@klaxon/atom/integrations/haunted.js';

const [countAtom] = atom({
  key: 'count',
  default: 1
});

const doubleCount = selector({
  key: 'doubleCount',
  get: ({getAtom}) => {
    const originalCount = getAtom(count);
    return originalCount * 2;
  }
});

function MyApp() {
  const [count, setCount] = useAtom(countAtom);
  const double = useSelector(doubleCount);

  return html`
    <div>${count}</div>
    <div>${doubleCount}</div>
  `
}

customElements.define('my-app', component(Counter));
```

## Preact

Hooks are also available for usage with Preact.

```js
import { render } from 'preact';
import { html } from 'htm/preact';
import { atom, selector } from '@klaxon/atom';
import { useAtom, useSelector } from '@klaxon/atom/integrations/preact.js';

const [countAtom] = atom({
  key: 'count',
  default: 1
});

const doubleCount = selector({
  key: 'doubleCount',
  get: ({getAtom}) => {
    const originalCount = getAtom(count);
    return originalCount * 2;
  }
});

function MyApp() {
  const [count, setCount] = useAtom(countAtom);
  const double = useSelector(doubleCount);

  return html`
    <div>${count}</div>
    <div>${doubleCount}</div>
  `
}

render(html`<${App} /><${App} />`, document.body);
```