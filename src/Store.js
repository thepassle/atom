class Store extends EventTarget {
  key;
  children = new Set();

  notify() {
    this.dispatchEvent(new CustomEvent(this.key, { 
      detail: {
        key: this.key
      } 
    }));
  }
}

export class Atom extends Store {
  state;
  effects = [];
  cleanupEffects = [];
  loadable;

  getState() {
    return this.state;
  }
}

export class Selector extends Store {
  value;
  get;
  // Selectors can also be dependent on Atoms and other Selectors
  parents = new Set();
}