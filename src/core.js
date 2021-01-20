import { Atom, Selector } from "./Store.js";

/**
 * @typedef {Object} selectorCallbacks
 * @property {(a: atom) => any} getAtom
 * @property {(s: selector) => Promise<any>} getSelector
 */

/**
 * @typedef {Object} atomOptions
 * @property {string} key
 * @property {any} [default]
 * @property {Array<() => void |(() => () => void)>} [effects]
 * @property {() => Promise<any>} [loadable]
 */

 /**
 * @typedef {Object} selectorOptions
 * @property {string} key
 * @property {(cbs: selectorCallbacks) => any | Promise<any>} get
 */

/**
 * @typedef {Promise} selector
 * @property {string} key
 */

/**
 * @typedef {Object} atom
 * @property {string} key
 * @property {() => any} getState
 * @property {() => void} update
 */


/** @param {Atom} atom */
const notify = atom => {
  atom.notify();
  atom.children?.forEach(child => {
    atom.dispatchEvent(new CustomEvent(child, { detail: {key: child}}))
  });
}

/**
 * @param {Atom} atom 
 * @param {any | (() => any)} val 
 */
export const updateAtom = (atom, val) => {
  atom.state = typeof val === 'function' ? val(atom.state) : val;
  notify(atom);
  atom.cleanupEffects = atom.effects?.map(effect => effect()) || [];
}


/**
 * @param {atomOptions} atomOptions 
 * @returns {[atom, (val?: any) => void | ((val?: any) => Promise<any>)]}
 */
export const atom = ({key, default: val, loadable, effects}) => {
  const atom = new Atom();

  if(val && loadable) throw new Error("Atom can't have a default and be loadable");

  atom.state = typeof val === 'function' ? val() : val;

  if(loadable) {
    atom.state = { status: 'initialized', result: null };
    atom.loadable = loadable;
  }

  atom.effects = effects || [];
  atom.cleanupEffects = atom.effects?.map(effect => effect());
  atom.key = key;

  return [
    atom,
    loadable 
      ? (val) => {
          atom.state.status = 'loading';

          notify(atom);
          atom.cleanupEffects = atom.effects?.map(effect => effect()) || [];

          return atom.loadable(val)
            .then((res) => {atom.state = {status: 'success', result: res}})
            .catch((err) => {atom.state = {status: 'error', result: err}})
            .finally(() => {notify(atom)});
        }
      : (val) => {
          updateAtom(atom, val);
        }
    ]
}


/** @param {selectorOptions} selector */
export const selector = async ({key, get}) => {
  const parents = new Set();
  const selector = new Selector();

  const updateSelectorVal = async () => {
    selector.value = await selector.get();
    selector.notify();
  }

  /**
   * @param {atom} atom 
   * @returns {any} state
   */
  const getAtom = (atom) => {
    atom.addEventListener(key, updateSelectorVal);
    parents.add(atom.key);
    atom.children.add(key);
    return atom.state;
  }

  /**
   * @param {selector} parentSelector 
   * @returns {Promise<any>} state
   */
  const getSelector = async (parentSelector) => {
    const parent = await parentSelector;
    parent.addEventListener(parent.key, updateSelectorVal);
  
    parents.add(parent.key);
    parent.children.add(key);
    return parent.value;
  }
  
  const createGet = ({getAtom, getSelector}) => async () => get({getAtom, getSelector});

  selector.key = key;
  selector.get = createGet({getAtom, getSelector});
  selector.parents = parents;
  selector.value = await selector.get();

  return selector
}