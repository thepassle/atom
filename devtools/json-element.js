var OpenEnum = {
  CLOSED: "closed",
  TOPONLY: "top-only",
  FULL: "full",
};

export default class JSONElement extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    this._value = {};
    this.open = OpenEnum.CLOSED;
  }

  set value(v) {
    this._value = v;
    this.render();
  }

  get value() {
    return this._value;
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
    <style>
      ${JSONElement.styles}
    </style>
    ${this.renderNode(undefined, this._value, 0)}`;
  }

  //
  // Main Renders
  //

  renderNode(key, obj, level) {
    const type = JSONElement.objType(obj);
    switch (type) {
      case "Object":
      case "Array":
        return this.renderParent(type, key, obj, level);
      default:
        return this.renderKeyValue(key, this.renderValue(type, obj));
    }
  }

  renderValue(type, value) {
    switch (type) {
      case "Boolean":
        return `${value ? "true" : "false"}`;
      case "String":
        return `"${value}"`;
      case "Number":
        return `${value}`;
      case "Date":
        return `${value.toISOString()}`;
      case "Null":
        return "null";
      case "Undefined":
        return "undefined";
      case "Function":
      case "Symbol":
        return `${value.toString()}`;
      default:
        return `###unsupported yet###`;
    }
  }

  renderParent(type, key, value, level) {
    // Should be open?
    const isOpen =
      this.open === OpenEnum.FULL ||
      (this.open === OpenEnum.TOPONLY && level == 0);

    const summary = `<summary>${this.renderSummaryObject(
      type,
      key,
      value
    )}</summary>`;

    let details = "";
    const keys = Reflect.ownKeys(value);
    const nextLevel = level + 1;
    keys.forEach((key) => {
      details += this.renderNode(key, value[key], nextLevel);
    });

    const detailsAttr = isOpen ? " open" : "";
    return `<details${detailsAttr}>${summary}<div>${details}</div></details>`;
  }

  renderKeyValue(key, value) {
    return `<div>${this.renderSpanKey(key)}${this.renderSpanValue(
      value
    )}</div>`;
  }

  renderSpanKey(key) {
    return key ? `<span class="key">${key}: </span>` : "";
  }

  renderSpanValue(value) {
    return value ? `<pre class="value">${value}</pre>` : "";
  }

  renderSpanLessImportant(value) {
    return value ? `<span class="less">${value}</span>` : "";
  }

  //
  // Summary renders
  //

  renderSummaryObject(type, key, value) {
    const maxItemsInSummary = 5;

    const frontkey = this.renderSpanKey(key);

    let openSummary = "";
    let closeSummary = "";
    let content = "";

    switch (type) {
      case "Object":
        openSummary = "Object {";
        closeSummary = "}";
        const keys = Reflect.ownKeys(value);
        content = keys.reduce((accu, key, index) => {
          if (index > maxItemsInSummary) return false;
          if (index == maxItemsInSummary)
            return accu + ` ${this.renderSpanLessImportant("...")}`;
          const child = value[key];
          return (
            accu +
            ` ${this.renderSpanKey(key)}${this.renderSummaryValue(child)}`
          );
        }, "");
        break;
      case "Array":
        openSummary = `Array(${value.length}) [`;
        closeSummary = " ]";
        const trimmedArray = value.slice(0, 5);
        trimmedArray.forEach((v, i) => {
          content += ` ${this.renderSpanKey("" + i)}${this.renderSummaryValue(
            v
          )}`;
        });
        if (trimmedArray.length < value.length) {
          content += ` ${this.renderSpanLessImportant("...")}`;
        }
        break;
    }

    return `${frontkey}${openSummary} <span class="show-when-closed">${content}</span> ${closeSummary}`;
  }

  renderSummaryValue(value) {
    const type = JSONElement.objType(value);
    switch (type) {
      case "Object":
        return this.renderSpanLessImportant("{...}");
      case "Array":
        return this.renderSpanLessImportant("[...]");
      default:
        return this.renderSpanValue(this.renderValue(type, value));
    }
  }

  //
  // Tools
  //

  static objType(obj) {
    const type = Object.prototype.toString.call(obj).slice(8, -1);
    if (type === "Object") {
      if (typeof obj[Symbol.iterator] === "function") {
        return "Iterable";
      }
      return obj.constructor.name;
    }

    return type;
  }

  //
  // Styles
  //

  static get styles() {
    return `
      :host {
        font-size: 12px;
        font-family: monospace;
      }

      pre {
        display: inline;
      }

      details > summary:focus {
        outline: none;
      }
      
      details > div {
        padding-left: 15px;
      }

      details[open=""] > summary > .show-when-closed {
        display : none;
      }

      .key {
        color: #61afef;
      }

      .key:hover {
        text-decoration: underline;
        cursor: pointer;
      }

      .value {
        color: white;
      }

      .less {
        color: #f6a7ba;
      }

    `;
  }
}

customElements.define("json-element", JSONElement);
