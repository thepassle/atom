import {LitElement, html,css} from 'lit-element';
import { render } from 'lit-html';
import {dialog} from '@generic-components/components';
import './json-element.js';

const EDIT = html`<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M3 17.46v3.04c0 .28.22.5.5.5h3.04c.13 0 .26-.05.35-.15L17.81 9.94l-3.75-3.75L3.15 17.1c-.1.1-.15.22-.15.36zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`;
const CLOSE = html`<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M18.3 5.71c-.39-.39-1.02-.39-1.41 0L12 10.59 7.11 5.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.89c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"/></svg>`
class AtomDevtools extends LitElement {
  static properties = {
    atoms: { type: Object },
    selectors: { type: Object },
    activeAtom: { type: Object },
    activeSelector: { type: Object },
    history: { type: Array },
    showHistory: { type: Boolean },
  }
  static styles = css`
    :host {
      display: block;
      height: 100vh; 
    }

    .svg {
      background: none;
      border: solid 2px rgb(46, 50, 54);
      border-radius: 5px;
    }

    .svg svg {
      fill: #61afef;
    }

    .svg:focus, .svg:hover {
      box-shadow: 0 0 0 2px #61afef;
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
      display: flex;
      flex-direction: row;
      align-items: center;
      border-radius: 3px;
      color: white;
      padding: 10px;
      background: rgb(69, 72, 76);
      font-size: 14px;
    }

    .state json-element {
      flex: 1;
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

    .timestamp {
      color: #61afef;
      padding: 5px 10px;
      font-size: 12px;
      background: #36393e;
      border-radius: 4px;
      border: solid 2px #36393e;
      text-transform: uppercase;
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

    .history-item {
      border-radius: 5px;
      padding: 10px;
      background: rgb(69, 72, 76);
      margin-bottom: 20px;
    }

    .history-item span {
      display: inline-block;
    }

    .history-item.atom {
      margin-right: 60px;
    }
    .history-item.selector {
      margin-left: 60px;
    }

    .timestamp.selector {
      color: white;
    }
    .timestamp.atom {
      color: #f6a7ba;
    }
    h1:hover {
      text-decoration: underline;
      cursor: pointer;
    }
    .activate:hover {
      text-decoration: underline;
      cursor: pointer;
    }
  `;

  constructor() {
    super();
    this.atoms = {};
    this.selectors = {};
    this.activeAtom = null;
    this.activeSelector = null;
    this.history = [];
    this.showHistory = true;
  }

  connectedCallback() {
    super.connectedCallback();

    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {msg: "get_latest"},
      ({data}) => {
        this.atoms = data.atoms;
        this.selectors = data.selectors;
        this.history = this.createHistory();
      });
    });

    chrome.runtime.onMessage.addListener(({msg, data}, _, sendResponse) => {
      if(msg === 'atomupdated') {
        this.atoms = data;
        this.history = this.createHistory();
      }
      
      if(msg === 'selectorupdated') {
        this.selectors = data;
        this.history = this.createHistory();
      }

      if(msg === 'get_latest') {
        const parsedData = JSON.parse(data);
        if(
          Object.keys(parsedData.atoms).length === 0 &&
          Object.keys(parsedData.selectors).length === 0 
        ) {
          return;
        }
        this.selectors = parsedData.selectors;
        this.atoms = parsedData.atoms;
        this.history = this.createHistory();
      }
    });

    // chrome.tabs.onUpdated.addListener(() => {
    //   chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    //     chrome.tabs.sendMessage(tabs[0].id, {msg: "get_latest"},
    //     ({data}) => {
    //       this.atoms = data.atoms;
    //       this.selectors = data.selectors;
    //       this.history = this.createHistory();
    //     });
    //   });
    // });
  }

  createHistory() {
    let history = [];
    for (const [, val] of Object.entries({...this.atoms, ...this.selectors})) {
      history = [...history, ...val];
    }
    return history.sort((a, b) => a.time - b.time).reverse();
  }

  executeOnPage(key, state) {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {msg: "replay_atom", data: {key, state}},
      () => {});
    });
  }

  openDialog(e, key, state) {
    const executeOnPage = (e, key) => {
      e.preventDefault();
      const newState = JSON.parse(e.target.elements['editedState'].value);
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {msg: "replay_atom", data: {key, state: newState}},
        () => {});
      });
    }

    dialog.open({
      invokerNode: e.target,
      content: (dialogNode) => {
        render(html`
          <div class="dialog">
            <div class="dialog-header">
              <h1>Edit ${key}</h1>
              <button @click=${() => dialog.close()}>${CLOSE}</button>
            </div>
            <form @submit=${(e) => executeOnPage(e, key)}>
              <textarea name="editedState" .value=${JSON.stringify(state, null, 2)}></textarea>
              <button type="submit">modify</button>
            </form>
          </div>
        `, dialogNode);
      }
    });
  }

  setActive(type, key) {
    if(type === 'atom') {
      this.activeAtom = key;
      this.activeSelector = null;
      this.showHistory = false;
    } 
    if(type === 'selector') {
      this.activeSelector = key;
      this.activeAtom = null;
      this.showHistory = false;
    }
    if(type === 'history') {
      this.activeSelector = null;
      this.activeAtom = null;
      this.showHistory = true;
    }
  }

  render() {
    return html`
      <header>
        <h1 @click=${() => this.setActive('history')}>Atom Devtools</h1>
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
        ${this.showHistory
          ? html`
            <div class="atom-overview">
              <h2>History</h2>
              ${this.history.map((obj) => html`
                  <div class="history-item ${obj.type}">
                    <span class="timestamp">${new Date(obj.time).toLocaleTimeString()}</span> 
                    <span @click=${() => this.setActive(obj.type, obj.key)} class="timestamp activate ${obj.type}">${obj.key}</span>
                    ${obj.state ? html`<button style="float: right;" class="replay" @click=${() => this.executeOnPage(obj.key, obj.state)}>replay</button>` : ''}
                    <div class="state">
                      <json-element .value=${obj.state ?? obj.value}></json-element>
                    </div class="state">
                  </div>
                `
              )}
            </div>
          `
          : ''
        }
        ${this.activeAtom
            ? html`
              <div class="atom-overview">
                <h2>${this.activeAtom}</h2>
                <h3>State:</h3>
                <div class="state">
                  <json-element .value=${this.atoms[this.activeAtom][0].state}></json-element>
                  <button @click=${(e) => this.openDialog(e, this.activeAtom, this.atoms[this.activeAtom][0].state)} class="svg">${EDIT}</button>
                </div>
                <h3 class="history">History:</h3>
                <ul>
                  ${this.atoms[this.activeAtom].map(({state, time}) => html`
                    <li class="history-li">
                      <span>${new Date(time).toLocaleTimeString()}</span>
                      <button class="replay" @click=${() => this.executeOnPage(this.activeAtom, state)}>replay</button>
                      <div class="state">
                        <json-element .value=${state}></json-element>
                      </div>
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
              <div class="state">
                <json-element .value=${this.selectors[this.activeSelector][0].value}></json-element>
              </div>
              <h3 class="history">History:</h3>
              <ul>
                ${this.selectors[this.activeSelector].map(({value, time}) => html`
                  <li class="history-li">
                    <span>${new Date(time).toLocaleTimeString()}</span>
                    <div class="state">
                      <json-element .value=${value}></json-element>
                    </div>
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