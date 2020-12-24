import {LitElement, html,css} from 'lit-element';

class AtomDevtools extends LitElement {
  static properties = {
    atoms: { type: Object },
    selectors: { type: Object },
    activeAtom: { type: Object },
    activeSelector: { type: Object },
  }
  static styles = css`
    :host {
      display: block;
      height: 100vh; 
    }

    h1 {
      text-align: center;
    }

    header {
      position: fixed;
      width: 100%;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #2e3236;
      box-shadow: rgba(0, 0, 0, 0.5) 0px 2px 5px 0px;
    }

    .main {
      display: flex;
      height: calc(100% - 45px);
      padding-top: 45px;
    }

    .atoms-list {
      background: #45484c;
      padding: 20px;
      width: 200px;
      overflow: auto;
    }

    .atoms-list button {
      width: 100%;
      background: #36393e;
      border: solid 2px #36393e;
      padding: 5px 15px;
      text-align: left;
      border-radius: 3px;
      margin-bottom: 8px;
      color: white;
    }

    .atoms-list button:hover, 
    .atoms-list button:active, 
    .atoms-list button:focus {
      background: #4b4e52;
      border: solid 2px #f6a7ba;
    } 

    .atoms-list h2 {
      text-align: center;
      color: white;
    }

    .atoms-list button.active {
      border: solid 2px #f6a7ba;
    }

    .atom-overview {
      padding: 20px;
      flex: 1;
      overflow: auto;
    }

    .atom-overview h2 {
      text-align: center;
    }

    .atom-overview h3 {
      color: white;
    }

    .state {
      border-radius: 3px;
      color: white;
      padding: 10px;
      background: rgb(69, 72, 76);
      font-size: 14px;
    }

    .history {
      margin-top: 50px;
    }

    .history-li {
      border-radius: 3px;
      color: white;
      padding: 10px;
      background: rgb(69, 72, 76);
      font-size: 14px;
      margin-bottom: 10px;
    }

    .history-li span {
      color: #61afef;
      padding: 5px 10px;
      font-size: 12px;
      background: #36393e;
      border-radius: 4px;
      border: solid 2px #36393e;
    }

    .replay {
      color: #61afef;
      padding: 5px 10px;
      font-size: 12px;
      background: #36393e;
      border-radius: 4px;
      margin-left: 5px;
      border: solid 2px #36393e;
      text-transform: uppercase;
    }

    .replay:hover,
    .replay:active,
    .replay:focus {
      border: solid 2px #61afef;
      cursor: pointer;
    }

    ul {
      list-style: none;
      padding: 0;
    }
  `;

  constructor() {
    super();
    this.atoms = {};
    this.selectors = {};
    this.activeAtom = null;
    this.activeSelector = null;
  }

  connectedCallback() {
    super.connectedCallback();

    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {msg: "get_latest"},
      ({data}) => {
        this.atoms = data.atoms;
        this.selectors = data.selectors;
      });
    });

    chrome.runtime.onMessage.addListener(({msg, data}, _, sendResponse) => {

      if(msg === 'atomupdated') {
        this.atoms = data;
        this.requestUpdate();
      }
      
      if(msg === 'selectorupdated') {
        this.selectors = data;
        this.requestUpdate();
      }
    });

    chrome.tabs.onUpdated.addListener(() => {
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {msg: "get_latest"},
        ({data}) => {
          this.atoms = data.atoms;
          this.selectors = data.selectors;
        });
      });
    });
  }

  executeOnPage(key, state) {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {msg: "replay_atom", data: {key, state}},
      () => {});
    });
  }

  setActive(type, key) {
    if(type === 'atom') {
      this.activeAtom = key;
      this.activeSelector = null;
    } else {
      this.activeSelector = key;
      this.activeAtom = null;
    }
  }

  render() {
    return html`
      <header>
        <h1>Atom Devtools</h1>
      </header>
      <div class="main">
        <div class="atoms-list">
          <h2>ATOMS</h2>
          <ul>
            ${Object.keys(this.atoms).map(atom => html`
              <li>
                <button class="${this.activeAtom === atom ? "active" : ""}" @click=${() => this.setActive('atom', atom)}>${atom}</button>
              </li>
            `)}
          </ul>
          <h2>SELECTORS</h2>
          <ul>
            ${Object.keys(this.selectors).map(selector => html`
              <li>
                <button class="${this.activeSelector === selector ? "active" : ""}" @click=${() => this.setActive('selector', selector)}>${selector}</button>
              </li>
            `)}
          </ul>
        </div>
        ${this.activeAtom
            ? html`
              <div class="atom-overview">
                <h2>${this.activeAtom}</h2>
                <h3>State:</h3>
                <pre class="state">${JSON.stringify(this.atoms[this.activeAtom][0].state, null, 2)}</pre>
                <h3 class="history">History:</h3>
                <ul>
                  ${this.atoms[this.activeAtom].map(({state, time}) => html`
                    <li class="history-li">
                      <span>${time}</span>
                      <button class="replay" @click=${() => this.executeOnPage(this.activeAtom, state)}>replay</button>
                      <pre>${JSON.stringify(state, null, 2)}</pre>
                    </li>
                  `)}
                </ul>
              </div>
            `
            : ''
          }
        ${this.activeSelector
          ? html`
            <div class="atom-overview">
              <h2>${this.activeSelector}</h2>
              <h3>State:</h3>
              <pre class="state">${JSON.stringify(this.selectors[this.activeSelector][0].value, null, 2)}</pre>
              <h3 class="history">History:</h3>
              <ul>
                ${this.selectors[this.activeSelector].map(({value, time}) => html`
                  <li class="history-li">
                    <span>${time}</span>
                    <pre>${JSON.stringify(value, null, 2)}</pre>
                  </li>
                `)}
              </ul>
            </div>
          `
          : ''
          }
      </div>
    `;
  }
}

customElements.define('atom-devtools', AtomDevtools);