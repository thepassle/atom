import { LitElement, html, css } from "lit-element";
import { LitAtom, atom, selector } from "../../index.js";
import { atoms, selectors } from '../../src/core.js';

console.log(atoms);

const oldDispatch = EventTarget.prototype.dispatchEvent;

// Maybe just setting `atoms` and `selectors` on the window is enough?

// https://github.com/open-wc/locator/blob/master/src/scripts/content_script.js

// Intercept dispatchEvent so we can notify the extension of statechanges
EventTarget.prototype.dispatchEvent = function(event) {
  // the state is update before we `notify` and `dispatchEvent`, so in here we only have access to the latest state

  // This could also be a Selector btw
  console.log('before', atoms.get(event.type).state);
  // - send message to extension with the atom/selector
  // - in the extension, log it in an array of history for that atom
  // - For timetravel: from the extension, we have to be able to send a message back to the page, get the relevant Atom from the `atoms` Map
  // and update its state and notify
  oldDispatch.call(this, event);

  // I think native `dispatchEvent` returns a boolean (I think its `preventDefault`?) should make sure I dont break that
};

requestIdleCallback(() => {
  // use the `atoms` and `selectors` Map to be able to list initial states of Atoms
  // send it to the extension somehow
  // Probably inject a content script that listens for a "__atom_init" event
  // and then in the content script chrome.runtime.sendMessage({}, () =>{})
  console.log(atoms);
});


const [count, setCount] = atom({
  key: 'count',
  default: 0,
});

// const doubleCount = selector({
//   key: 'doubleCount',
//   get: ({getAtom}) => {
//     const cnt = getAtom(count);
//     return cnt * 2;
//   }
// });

// console.log(atoms);

// setCount(1);
// setCount(2);

// console.log(selectors);
