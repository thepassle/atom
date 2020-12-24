# Atom Devtools

- `registerDevtools` patches `Atom.prototype.notify` to dispatch a `__ATOM` event to the content script with as detail:
```js
detail: {
  key: this.key,
  state: this.state
}
```

- The content script really only catches the `__ATOM` event and passes it through to the extension with a `atomupdated` message

- The chrome extension panel receives the message

When you open the devtools, it should send a message to the page/content script to get the latest state of all atoms

```js
chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
  chrome.tabs.sendMessage(tabs[0].id, {msg: "get_latest"},
  /** @type {(res: MessageResponse) => void} */
  ({elements, host, href}) => {
    this.customElements = elements;
    this.host = host;
    this.href = href;

    this.__resolveLatestElements();
  });
});
```