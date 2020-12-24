const globalstate = {};


requestIdleCallback(() => {
  const s = document.createElement('script');
  s.innerHTML = `
    window.addEventListener('__replay_atom', (e) => {
      console.log(e);
      const atom = window.__atoms.get(e.detail.key);
      atom.state = e.detail.state;
      atom.notify();
    });
  `;
  document.body.append(s);
  document.body.removeChild(s);
  
  document.addEventListener('__ATOM', (e) => {
    const { key, state } = e.detail;
    globalstate[key] = [...(globalstate[key] || []), {state, time: new Date().toLocaleTimeString()}];
    console.log('[GLOBAL]:', globalstate);
    chrome.runtime.sendMessage({
      msg: 'atomupdated',
      data: globalstate
    }, () => {});
  });

});

document.addEventListener('__ATOM_INIT', (e) => {
  const atoms = e.detail;
  console.log('[CS ATOMS]:', atoms);
  Object.entries(atoms).forEach(([key, val]) => {
    if(!(key in globalstate)) {
      globalstate[key] = [...(globalstate[key] || []), {state: val, time: new Date().toLocaleTimeString()}];
    }
  });
  
  chrome.runtime.sendMessage({
    msg: 'atomupdated',
    data: globalstate
  }, () => {});
});

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  if(request.msg === "get_latest") {
    sendResponse({
      data: globalstate
    });
    return true;
  }

  if(request.msg === "replay_atom") {
    console.log('replay atom', request)

    window.dispatchEvent(new CustomEvent('__replay_atom', {
      detail: {
        key: request.data.key,
        state: request.data.state
      }
    }))
  }
});