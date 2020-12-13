<script type="module" src="../../components/wcd-snippet.js"></script>

# Nested Selector || 5

<wcd-snippet data-id="2rfSJGkJU5WG8KleOwve">

  ```js
    import { LitElement, html } from "lit-element";
    import { LitAtom, atom, selector } from "@klaxon/atom";

    const [count, setCount] = atom({
      key: 'count',
      default: 0
    });

    const countPlusOne = selector({
      key: 'countPlusOne',
      get: ({getAtom}) => {
        const originalCount = getAtom(count);
        return originalCount + 1;
      }
    });

    const countPlusTen = selector({
      key: 'countPlusTen',
      get: async ({getSelector}) => {
        const previousSelector = await getSelector(countPlusOne);
        return previousSelector + 10;
      }
    });

    export class MyCounter extends LitAtom(LitElement) {
      static get atoms() {
        return [count];
      }

      static get selectors() {
        return [countPlusOne, countPlusTen];
      }

      render() {
        return html`
          <button @click="${() => setCount(old => old - 1)}">-</button>
          <div>count: ${this.count}</div>
          <div>countPlusOne: ${this.countPlusOne}</div>
          <div>countPlusTen: ${this.countPlusTen}</div>
          <button @click="${() => setCount(old => old + 1)}">+</button>
        `;
      }
    }

    customElements.define("my-counter", MyCounter);
  ```

</wcd-snippet>