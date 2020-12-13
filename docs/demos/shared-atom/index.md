<script type="module" src="../../components/wcd-snippet.js"></script>

# Shared Atom || 2

<wcd-snippet data-id="YLH6g2tIsdpNxDZm9ful">

  ```js
    import { LitElement, html, css } from "lit-element";
    import { LitAtom, atom } from "@klaxon/atom";

    const [count, setCount] = atom({
      key: 'count',
      default: 0
    });

    export class MyCounter extends LitAtom(LitElement) {
      static get atoms() {
        return [count];
      }

      static styles = css`:host{display: block;}`

      render() {
        return html`
          <button @click="${() => setCount(old => old - 1)}">-</button>
          <span>${this.count}</span>
          <button @click="${() => setCount(old => old + 1)}">+</button>
        `;
      }
    }

    customElements.define("my-counter", MyCounter);


    class SharedAtom extends LitAtom(LitElement) {
      static get atoms() {
        return [count];
      }

      static styles = css`:host{display: block;}`

      render() {
        return html`
          <div>I'm a shared atom: ${this.count}</div>
        `;
      }
    }

    customElements.define("shared-atom", SharedAtom);
  ```

</wcd-snippet>