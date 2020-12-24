import {LitElement, html,css} from 'lit-element';

class AtomDevtools extends LitElement {
  static properties = {
    atoms: { type: Object },
    activeAtom: { type: Object }
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
    }

    ul {
      list-style: none;
      padding: 0;
    }
  `;

  constructor() {
    super();
    this.atoms = {};
    this.activeAtom = null;
  }

  connectedCallback() {
    super.connectedCallback();

    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {msg: "get_latest"},
      ({data}) => {
        this.atoms = data;
        console.log('$$$$', {atoms: this.atoms, data});
      });
    });

    chrome.runtime.onMessage.addListener(({msg, data}, _, sendResponse) => {
      if(msg === 'atomupdated') {
        console.log('####', data);
        this.atoms = data;
        this.requestUpdate();
      }
    });
  }

  executeOnPage(key, state) {
    console.log({key, state});
    
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {msg: "replay_atom", data: {key, state}},
      () => {});
    });
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
                <button class="${this.activeAtom === atom ? "active" : ""}" @click=${() => {this.activeAtom = atom}}>${atom}</button>
              </li>
            `)}
          </ul>
        </div>
        <div class="atom-overview">
          ${this.activeAtom
            ? html`
              <h2>${this.activeAtom}</h2>
              <h3>State:</h3>
              <pre class="state">${JSON.stringify(this.atoms[this.activeAtom].reverse()[0].state, null, 2)}</pre>
              <h3 class="history">History:</h3>
              <ul>
                ${this.atoms[this.activeAtom].map(({state, time}) => html`
                  <li class="history-li">
                    <span>${time}</span>
                    <pre>${JSON.stringify(state, null, 2)}</pre>
                    <button @click=${() => this.executeOnPage(this.activeAtom, state)}>replay</button>
                  </li>
                `)}
              </ul>
            `
            : ''
          }
        </div>
      </div>
    `;
  }
}

customElements.define('atom-devtools', AtomDevtools);