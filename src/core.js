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

/** @type {Map<string, Atom>} */
export const atoms = new Map();
/** @type {Map<string, Selector>} */
export const selectors = new Map();

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
  if(!atoms.has(key)) {
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

    atoms.set(key, atom);
  }

  return [{
    key,
    getState: () => atoms.get(key).state,
    update: () => {notify(atoms.get(key))}
  },
  loadable 
    ? (val) => {
        const atom = atoms.get(key);
        atom.state.status = 'loading';

        notify(atom);
        atom.cleanupEffects = atom.effects?.map(effect => effect()) || [];

        return atom.loadable(val)
          .then((res) => {atom.state = {status: 'success', result: res}})
          .catch((err) => {atom.state = {status: 'error', result: err}})
          .finally(() => {notify(atom)});
      }
    : (val) => {
        const atom = atoms.get(key);
        updateAtom(atom, val);
      }
  ]
}


/** @param {selectorOptions} selector */
export const selector = async ({key, get}) => {
  const parents = new Set();

  const updateSelectorVal = async () => {
    const selector = selectors.get(key);
    /**
     * If there are more than 0 components subscribed to a Selector, execute its `get` fn
     * If there are no components subscribed to a Selector, avoid updating its value
     */
    selector.value = await selector.get();
    selector.notify();
  }

  /**
   * @param {atom} atom 
   * @returns {any} state
   */
  const getAtom = ({key: atomKey}) => {
    const atom = atoms.get(atomKey);
    atom.addEventListener(key, updateSelectorVal);
    parents.add(atomKey);
    atom.children.add(key);
    return atom.state;
  }

  /**
   * @param {selector} parentSelector 
   * @returns {Promise<any>} state
   */
  const getSelector = async (parentSelector) => {
    const { key: parentKey } = await parentSelector;
    const parent = selectors.get(parentKey);
    parent.addEventListener(parentKey, updateSelectorVal);
  
    parents.add(parentKey);
    parent.children.add(key);
    return parent.value;
  }
  
  const createGet = ({getAtom, getSelector}) => async () => get({getAtom, getSelector});

  if(!selectors.has(key)) {
    const selector = new Selector();
    selector.key = key;
    selector.get = createGet({getAtom, getSelector});
    selector.parents = parents;
    selectors.set(key, selector);
    selector.value = await selector.get();
  }

  return {
    key,
  }
}