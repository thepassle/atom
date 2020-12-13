# guides || 1

> ⚠️ Atom is in a very experimental state and APIs are subject to change.

> Have you found a bug? Do you have ideas for features? Are you missing something? Let me know on github!
> Want to contribute? Even better! Please send a PR on github

## Motivation

Oh no. Another state manager.

I've been looking for a state manager that _just_ feels right for a while now, for both personal use, as well as professional use. A while ago I worked on a hobby project where we used JavaScripts native `EventTarget` for reactivity, and ever since I've been trying to find a way to generalize and abstract those concepts into a coherent state manager.

Recently I discovered [Recoil](http://recoiljs.org/), an experimental state manager by the folks at Facebook. Recoil seemed to encompass a lot of the concepts I was interested in; no global store, independent and efficient updates, reactivity, and a graph-like data flow.

This project started as an experiment for exploration and learning purposes, and many of the concepts are heavily inspired by Recoil. Credit goes to them.

While there are many similarities between Atom and Recoil, there are also many differences in the APIs; the goal of this project is not to be a 1-on-1 port of Recoil.

## Integrations

Currently there is only one integration for Atom, implemented for [LitElement](https://lit-element.polymer-project.org/). The concepts of Atom are not limited to LitElement however, and can be applied to other web component libraries. Here's a simple example:

<details>
  <summary>
  example
  </summary>

  ```js
  import { atoms, selectors } from '@klaxon/atom';

  export const Atom = (klass) => class Atom extends klass {
    constructor() {
      super();
      this.__atomUpdate = this.__atomUpdate.bind(this);
      this.__selectorUpdate = this.__selectorUpdate.bind(this);
    }

    async connectedCallback() {
      super.connectedCallback?.();

      this.constructor.atoms?.forEach(({key}) => {
        const atom = atoms.get(key);
        atom.addEventListener(key, this.__atomUpdate);
        this[key] = atom.state;
      });

      this.constructor.selectors?.forEach(async (selector) => {
        const { key } = await selector;
        const currSelector = selectors.get(key);
        currSelector.addEventListener(key, this.__selectorUpdate);
        this[key] = currSelector.value;
      });

      this.scheduleUpdate();
    }

    disconnectedCallback() {
      this.constructor.atoms?.forEach(({key}) => {
        const store = atoms.get(key);
        store.cleanupEffects.forEach(effect => effect());
        store.removeEventListener(key, this.__atomUpdate);
      });

      this.constructor.selectors?.forEach(async (selector) => {
        const { key } = await selector;
        const currSelector = selectors.get(key);
        currSelector.removeEventListener(key, this.__selectorUpdate);
      });
      super.disconnectedCallback?.();
    }

    __atomUpdate(e) {
      const { key } = e.detail;
      const store = atoms.get(key);

      this[key] = store.state;
      this.scheduleUpdate();
    }

    __selectorUpdate(e) {
      const { key } = e.detail;
      const selector = selectors.get(key);

      this[key] = selector.value;
      this.scheduleUpdate();
    }

    async scheduleUpdate() {
      if(!this.__atomUpdateRequested) {
        this.__atomUpdateRequested = true;
        this.__atomUpdateRequested = await false;
        this.render(); // or any render/update method the baseclass uses
      }
    }
  }
  ```
</details>


## Roadmap

- namespacing
- `atomFamily` utility; essentially an Atom that can hold many Atoms
- Performance optimization: batch nested Selector calls (only run a Selectors `get` once when multiple Selectors/components depend on it)
- Devtools