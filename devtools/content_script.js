const globalAtomState = {};
const globalSelectorState = {};


requestIdleCallback(() => {
  const s = document.createElement('script');
  s.innerHTML = `
    window.addEventListener('__replay_atom', (e) => {
      const atom = window.__atoms.get(e.detail.key);
      atom.state = e.detail.state;
      atom.notify(false);
      atom.children?.forEach(child => {
        atom.dispatchEvent(new CustomEvent(child, { detail: {key: child}}))
      });
    });
  `;
  document.body.append(s);
  document.body.removeChild(s);
  
  document.addEventListener('__SELECTOR', (e) => {
    if(!e.detail?.key || !e.detail?.value) return;
    const { key, value } = e.detail;

    globalSelectorState[key] = [{value, time: new Date().toLocaleTimeString()}, ...(globalSelectorState[key] || [])];

    chrome.runtime.sendMessage({
      msg: 'selectorupdated',
      data: globalSelectorState
    }, () => {});
  });

  document.addEventListener('__ATOM', (e) => {
    const { key, state } = e.detail;
    globalAtomState[key] = [{state, time: new Date().toLocaleTimeString()}, ...(globalAtomState[key] || [])];

    chrome.runtime.sendMessage({
      msg: 'atomupdated',
      data: globalAtomState
    }, () => {});
  });

});

document.addEventListener('__ATOM_INIT', (e) => {
  const atoms = e.detail;
  Object.entries(atoms).forEach(([key, val]) => {
    if(!(key in globalAtomState)) {
      globalAtomState[key] = [...(globalAtomState[key] || []), {state: val, time: new Date().toLocaleTimeString()}];
    }
  });
  
  // chrome.runtime.sendMessage({
  //   msg: 'atomupdated',
  //   data: globalAtomState
  // }, () => {});
});

document.addEventListener('__SELECTOR_INIT', (e) => {
  const selectors = e.detail;
  Object.entries(selectors).forEach(([key, val]) => {
    if(!(key in globalSelectorState)) {
      globalSelectorState[key] = [...(globalSelectorState[key] || []), {value: val, time: new Date().toLocaleTimeString()}];
    }
  });
  
  // chrome.runtime.sendMessage({
  //   msg: 'selectorupdated',
  //   data: globalSelectorState
  // }, () => {});
});

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  if(request.msg === "get_latest") {
    sendResponse({
      data: {
        atoms: globalAtomState,
        selectors: globalSelectorState
      }
    });
    return true;
  }

  if(request.msg === "replay_atom") {
    window.dispatchEvent(new CustomEvent('__replay_atom', {
      detail: {
        key: request.data.key,
        state: request.data.state
      }
    }))
  }
});