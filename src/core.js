import { Atom, Selector } from "./Store.js";

/**
 * @typedef {Object} selectorCallbacks
 * @property {(a: Atom) => any} getAtom
 * @property {(s: Selector) => Promise<any>} getSelector
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
 * @param {atomOptions} atomOptions 
 * @returns {[Atom, (val?: any) => void | ((val?: any) => Promise<any>)]}
 */
export const atom = ({key, default: val, loadable, effects}) => {
  const atom = new Atom();

  if(val && loadable) throw new Error("Atom can't have a default and be loadable");

  if(loadable) {
    atom.setState({ status: 'initialized', result: null });
    atom.loadable = loadable;
  } else {
    atom.setState(typeof val === 'function' ? val() : val);
  }

  atom.effects = effects || [];
  atom.cleanupEffects = atom.effects?.map(effect => effect());
  atom.key = key;

  return [
    atom,
    loadable 
      ? (val) => {
          atom.setState({status: 'loading', result: null});

          return atom.loadable(val)
            .then((res) => {atom.setState({status: 'success', result: res})})
            .catch((err) => {atom.setState({status: 'error', result: err})})
        }
      : (val) => {
          atom.setState(val);
        }
    ]
}

/** 
 * @param {selectorOptions} options
 * @return {Selector} selector
 */
export const selector = async ({key, get}) => {
  const selector = new Selector();

  const updateSelectorVal = async () => {
    selector.value = await selector.get();
    selector.notify();
  }

  /**
   * @param {Atom} atom 
   * @returns {any} state
   */
  const getAtom = (atom) => {
    atom.addEventListener(key, updateSelectorVal);
    atom.children.add(key);
    return atom.getState();
  }

  /**
   * @param {Selector} parentSelector 
   * @returns {Promise<any>} state
   */
  const getSelector = async (parentSelector) => {
    const parent = await parentSelector;
    parent.addEventListener(parent.key, updateSelectorVal);
  
    parent.children.add(key);
    return parent.value;
  }
  
  const createGet = ({getAtom, getSelector}) => async () => get({getAtom, getSelector});

  selector.key = key;
  selector.get = createGet({getAtom, getSelector});
  selector.value = await selector.get();

  return selector;
}