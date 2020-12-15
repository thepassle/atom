const template = document.createElement("template");
template.innerHTML = `
  <style>
  :host {
    display: block;
    position: relative;
    width: 100%;
    height: auto;
  }

  iframe {
    display: none;
    border: 0;
    overflow: hidden;
  }

  #snippet {
    display: contents;
  }

  :host([live]) iframe {
    display: block;
    width: var(--iframe-width, 100%);
    height: var(--iframe-height, 600px);
  }

  :host([live]) #snippet {
    display: none;
  }

  button {
    color: inherit;
    position: absolute;
    bottom: 0;
    right: 0;
    border-top-left-radius: 6px;
    padding: 9px 16px;
    border: none;
    cursor: pointer;
    display: block;
    font-size: 16px;
    background: var(--wcd-snippet-button-background, hsla(100% 100% 100% / 0.9));
    outline: none;
    transition: color, background 0.1s ease;
  }

  button:focus,
  button:hover {
    color: var(--wcd-snippet-button-focus-color, hsla(0 100% 100% / 0.75));
    background: var(--wcd-snippet-button-focus-background, hsla(0 100% 0% / 0.75));
  }

  </style> 
  
  <div id="snippet"><slot></slot></div>

  <iframe part="iframe" sandbox="allow-scripts allow-forms allow-same-origin"></iframe>

  <button part="button">Show Live</button>
`;

class WcdSnippet extends HTMLElement {
  static get observedAttributes() {
    return ['live', 'data-id', 'file'];
  }

  constructor() {
    super();
    this.show = this.show.bind(this);
    this.attachShadow({ mode: "open" }).append(template.content.cloneNode(true));
    this.button.addEventListener('click', this.show);
  }

  $(x) { return this.shadowRoot.querySelector(x); }

  get iframe() { return this.$("iframe"); }
  get button() { return this.$("button"); }

  get url() {
    const id = this.dataset.id;
    const file = this.getAttribute('file');
    const url = new URL(`https://webcomponents.dev/edit/${id}`);
    const { title = "Web Component" } = this.dataset;
    url.searchParams.set("embed", 1);
    url.searchParams.set("sv", 1);
    url.searchParams.set("pm", 1);
    if (file)
      url.searchParams.set("file", file);
    return `https://webcomponents.dev/edit/${id}${!file ? '': `?file=${file}`}`
  }

  attributeChangedCallback(name, oldVal, newVal) {
    switch (name) {
      case 'live': 
        if (!oldVal && newVal !== null)
          this.load();
        break;
      case 'data-id':
      case 'file':
        if (this.hasAttribute('live'))
          this.load();
        break;
    }
  }

  show() {
    this.setAttribute("live", '');
  }

  load() {
    this.iframe.src = this.url.toString();
  }
}

customElements.define("wcd-snippet", WcdSnippet);
