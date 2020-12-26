import {LitElement} from 'lit-element';

const reactor = Symbol();

export class Reactor {
  constructor(callback) {
    this.callback = callback;
    this.atoms = new Set();
  }

  dispose() {
    for (const key of this.atoms) {
      const found = atoms.get(key);
      if (found) {
        found.removeEventListener(key, this.callback);
      }
    }
  }

  track(fn) {
    const originalGet = atoms.get;

    atoms.get = (key) => {
      this.atoms.add(key);
      return originalGet.call(atoms, key);
    };

    fn();

    atoms.get = originalGet;

    for (const [key, atom] of atoms.entries()) {
      if (this.atoms.has(key)) {
        atom.addEventListener(key, this.callback);
      }
    }
  }
}

export class AtomLitElement extends LitElement {
  connectedCallback() {
    super.connectedCallback();

    this[reactor] = new Reactor(() => {
      this.requestUpdate();
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    if (this[reactor]) {
      this[reactor].dispose();
      this[reactor] = undefined;
    }
  }

  update(change) {
    const instance = this[reactor];

    if (instance) {
      instance.track(super.update.bind(this, change));
    } else {
      super.update(change);
    }
  }
}
