<script type="module" src="../../components/wcd-snippet.js"></script>

# Basic Atom || 1

<wcd-snippet data-id="4jOEMPDsdljAVmAmoQSJ">

  ```js
    import { LitElement, html } from "lit-element";
    import { LitAtom, atom } from "@klaxon/atom";

    const [count, setCount] = atom({
      key: 'count',
      default: 0
    });

    export class MyCounter extends LitAtom(LitElement) {
      static get atoms() {
        return [count];
      }

      render() {
        return html`
          <button @click="${() => setCount(old => old - 1)}">-</button>
          <span>${this.count}</span>
          <button @click="${() => setCount(old => old + 1)}">+</button>
        `;
      }
    }

    customElements.define("my-counter", MyCounter);


  ```

</wcd-snippet>