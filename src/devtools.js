import { Atom, Selector } from "./Store.js";
import { atoms, selectors } from './core.js';

export function registerDevtools() {
  window.__atoms = atoms;
  window.__selectors = selectors;
  
  const oldSelectorNotify = Selector.prototype.notify;
  Selector.prototype.notify = function(dispatch = true) {
    if(dispatch) {
      document.dispatchEvent(new CustomEvent('__SELECTOR', {
        detail: {
          key: this.key,
          value: this.value
        }
      }));
    }
    oldSelectorNotify.call(this);
  };

  const oldAtomNotify = Atom.prototype.notify;
  Atom.prototype.notify = function(dispatch = true) {
    if(dispatch) {
      document.dispatchEvent(new CustomEvent('__ATOM', {
        detail: {
          key: this.key,
          state: this.state
        }
      }));
    }
    oldAtomNotify.call(this);
  };

  requestIdleCallback(() => {
    const allAtoms = {};
    atoms.forEach((val, key) => {
      allAtoms[key] = val.state;
    });

    document.dispatchEvent(new CustomEvent('__ATOM_INIT', {
      detail: allAtoms
    }));

    const allSelectors = {};
    selectors.forEach((val, key) => {
      if(val.value?.type === 'html') {
        allSelectors[key] = "TemplateResult";
      } else {
        allSelectors[key] = val.value;
      }
    });

    document.dispatchEvent(new CustomEvent('__SELECTOR_INIT', {
      detail: allSelectors
    }));
  });
}