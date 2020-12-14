<script type="module" src="../../components/wcd-snippet.js"></script>

# Atoms || 1

## Basic Atom

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

## Shared Atom

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

## Loadable Atom

<wcd-snippet data-id="ja26RtwP18lDvXb6gXBV">

  ```js
    import { LitElement, html, css } from 'lit-element';
    import { atom, LitAtom } from '@klaxon/atom';

    const [query, setQuery] = atom({
      key: 'query',
      loadable: async (id = 1) => {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const body = await res.json();
        return body;
      }
    });

    const sleep = () => new Promise(res => setTimeout(res, 2000));

    (async () => {
      await sleep();
      await setQuery(2);
      await sleep();
      await setQuery(3);
    })();

    class MyApp extends LitAtom(LitElement) {
      static get atoms() {
        return [query];
      }

      render() {
        switch(this.query.status) {
          case 'success':
            return html`Success! ${this.query.result.name}`;
          case 'error':
            return html`error! :(`;
          case 'pending':
          default:
            return html`Loading...`;
        }
      }
    }

    customElements.define('my-app', MyApp);

  ```

</wcd-snippet>