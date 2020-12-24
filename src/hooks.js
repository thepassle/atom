import { atoms, selectors } from "./core.js";
import { useState, useEffect } from 'haunted';

export function useSelector(selector) {
  const [state, setState] = useState(null);
  
  useEffect(async () => {
    const { key } = await selector;
    const ogSelector = selectors.get(key);
    setState(ogSelector.value);

    const updateState = () => {setState(ogSelector.value)}
 
    ogSelector.addEventListener(key, updateState);
    return () => {
      ogSelector.removeEventListener(key, updateState);
    }
  }, []);

  return state;
}

export function useAtom({key}) {
  const atom = atoms.get(key);
  const [state, setState] = useState(atom.state);

  const updateState = () => {setState(atoms.get(key).state)}

  useEffect(() => {
    atom.addEventListener(key, updateState);
    return () => {
      atom.removeEventListener(key, updateState);
    }
  }, []);

  return [
    state, 
    (val) => {
      const atom = atoms.get(key);
      atom.state = typeof val === 'function' ? val(atom.state) : val;
      atom.notify();
      atom.children?.forEach(child => {
        atom.dispatchEvent(new CustomEvent(child, { detail: {key: child}}))
      });
    }
  ]
}
