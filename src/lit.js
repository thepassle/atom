import { atoms, selectors, updateAtom } from './core.js';

export const LitAtom = (klass) => class LitAtom extends klass {
  constructor() {
    super();
    this.__atomUpdate = this.__atomUpdate.bind(this);
    this.__selectorUpdate = this.__selectorUpdate.bind(this);
    this.litAtomUpdateComplete = this.__createDeferredPromise();
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
      if(currSelector.active === 0) {
        this[key] = await currSelector.get();
      } else {
        this[key] = currSelector.value;
      }
      currSelector.active = currSelector.active+1;

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
      currSelector.active = currSelector.active-1;
      currSelector.removeEventListener(key, this.__selectorUpdate);
    });
    super.disconnectedCallback?.();
  }

  __atomUpdate(e) {
    const { key } = e.detail;
    const store = atoms.get(key);

    this[key] = store.state;
    console.log('[ATOM]', key, this[key])
    this.scheduleUpdate();
  }

  __selectorUpdate(e) {
    const { key } = e.detail;
    const selector = selectors.get(key);

    this[key] = selector.value;
    console.log('[SELECTOR]', key, this[key]);
    this.scheduleUpdate();
  }

  /**
   * Batch updates in a task to make sure all async selectors
   * have run, and only THEN rerender. Avoids multiple renders
   * when a component uses multiple selectors.
   * 
   * Users can opt out of this behavior by adding the property 
   * to LitElement's static properties getter. This way the 
   * update will be requested as soon as the property gets set,
   * and rendered on LitElement's microtask timing.
   */ 
  scheduleUpdate() {
    if(!this.__litAtomUpdateRequested) {
      this.__litAtomUpdateRequested = true;
      setTimeout(async () => {
        this.__litAtomUpdateRequested = false;
        await this.requestUpdate();
        this.__resolve();
        this.litAtomUpdateComplete = this.__createDeferredPromise();
        console.log(`✅ [UPDATED] <${this.localName}>`);
      });
    }
  }

  /**
   * @param {atom} atom 
   * @param {any | ((oldState: any) => any)} val 
   */
  updateAtom({key}, val) {
    const atom = atoms.get(key);
    updateAtom(atom, val);
  }

  __createDeferredPromise() {
    return new Promise(res => {
      this.__resolve = res;
    });
  }
}