class Store extends EventTarget {
  key;
  children = new Set();

  notify() {
    this.dispatchEvent(new CustomEvent(this.key, { detail: {key: this.key} }));
    this.children?.forEach(child => {
      this.dispatchEvent(new CustomEvent(child, { detail: {key: child} }));
    });
  }
}

export class Atom extends Store {
  #state;
  effects = [];
  cleanupEffects = [];
  loadable;
  
  setState(val) {
    this.#state = typeof val === 'function' ? val(this.getState()) : val;
    this.notify();
    this.cleanupEffects = this.effects?.map(effect => effect()) || [];
  }

  getState() {
    return this.#state;
  }
}

export class Selector extends Store {
  value;
  get;
}