import { updateAtom } from '../src/core.js';

export const LitAtom = (klass) => class LitAtom extends klass {
  constructor() {
    super();
    this.__atomUpdate = this.__atomUpdate.bind(this);
    this.__selectorUpdate = this.__selectorUpdate.bind(this);
    this.litAtomUpdateComplete = this.__createDeferredPromise();
  }

  async connectedCallback() {
    super.connectedCallback?.();

    this.constructor.atoms?.forEach((atom) => {
      atom.addEventListener(atom.key, this.__atomUpdate);
      this[atom.key] = atom.state;
      this[`__${atom.key}`] = atom;
    });

    this.constructor.selectors?.forEach(async (selector) => {
      const currSelector = await selector;
      currSelector.addEventListener(currSelector.key, this.__selectorUpdate);
      this[currSelector.key] = currSelector.value;
      this[`__${currSelector.key}`] = currSelector;
    });

    this.scheduleUpdate();
  }

  disconnectedCallback() {
    this.constructor.atoms?.forEach((atom) => {
      atom.cleanupEffects.forEach(effect => effect());
      atom.removeEventListener(atom.key, this.__atomUpdate);
    });

    this.constructor.selectors?.forEach(async (selector) => {
      const currSelector = await selector;
      currSelector.removeEventListener(selector.key, this.__selectorUpdate);
    });
    super.disconnectedCallback?.();
  }

  __atomUpdate(e) {
    const { key } = e.detail;
    this[key] = this[`__${key}`].getState();
    // console.log('[ATOM]', key, this[key])
    this.scheduleUpdate();
  }

  __selectorUpdate(e) {
    const { key } = e.detail;
    this[key] = this[`__${key}`].value;
    // console.log('[SELECTOR]', key, this[key]);
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
        // console.log(`✅ [UPDATED] <${this.localName}>`);
      });
    }
  }

  /**
   * @param {atom} atom 
   * @param {any | ((oldState: any) => any)} val 
   */
  updateAtom(atom, val) {
    updateAtom(atom, val);
  }

  __createDeferredPromise() {
    return new Promise(res => {
      this.__resolve = res;
    });
  }
}