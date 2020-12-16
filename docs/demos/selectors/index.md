<script type="module" src="../../components/wcd-snippet.js"></script>

# Selectors || 2

## Basic Selector


<wcd-snippet data-id="uWLujWOevr8YMBTARTt6">

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

    export class MyCounter extends LitAtom(LitElement) {
      static atoms = [count];
      static selectors = [countPlusOne];

      render() {
        return html`
          <button @click="${() => setCount(old => old - 1)}">-</button>
          <div>count: ${this.count}</div>
          <div>countPlusOne: ${this.countPlusOne}</div>
          <button @click="${() => setCount(old => old + 1)}">+</button>
        `;
      }
    }

    customElements.define("my-counter", MyCounter);
  ```

</wcd-snippet>

## Nested Selectors


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
      static atoms = [count];
      static atoms = [countPlusOne, countPlusTen];

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

## Data fetching Selector

<wcd-snippet data-id="TtPOTzKYk66fheQQzUTX">

  ```js
    import { LitElement, html, css } from 'lit-element';
    import { atom, selector, LitAtom } from '@klaxon/atom';


    const [selected, setSelected] = atom({
      key: 'selected',
      default: null
    });

    const selectedPokemon = selector({
      key: 'selectedPokemon',
      get: async ({getAtom}) => {
        const id = getAtom(selected);

        if(id === null) return null;
        return await (await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)).json();
      }
    });

    class MyApp extends LitAtom(LitElement) {
      static selectors = [selectedPokemon];

      static get properties() {
        return {
          pokemon: { type: Array }
        }
      }

      async connectedCallback() {
        super.connectedCallback();
        this.pokemon = (await (await fetch('https://pokeapi.co/api/v2/pokemon')).json()).results;
      }

      static styles = css`
        :host {
          display: flex;
          flex-direction: row;
        }

        .pokemon {
          list-style: none;
        }
      `

      render() {
        return html`
          <div>
            <ul class="pokemon">
              <h2>Pokemon:</h2>
              ${this.pokemon?.map((pokemon, idx) => html`
                <li>${pokemon.name} <button @click=${() => setSelected(idx+1)}>show info</button></li>
              `)}
            </ul>
          </div>
          <div>
            <h2>Pokemon info:</h2>
            ${this.selectedPokemon
              ? html`
                  <ul>
                    <img alt="${this.selectedPokemon?.name}" src="${this.selectedPokemon?.sprites['front_default']}"/>
                    <li>name: ${this.selectedPokemon?.name}</li>
                    <li>height: ${this.selectedPokemon?.height}</li>
                    <li>weight: ${this.selectedPokemon?.weight}</li>
                  </ul>
                `
              : ''
            }
          </div>
        `;
      }
    }

    customElements.define('my-app', MyApp);

  ```

</wcd-snippet>

## Data fetching Selector with loadable Atom

<wcd-snippet data-id="l9zERzpgymZzcdB7Vvaf">

  ```js
    import { LitElement, html } from 'lit-element';
    import { atom, selector, LitAtom } from '@klaxon/atom';

    const [query, setQuery] = atom({
      key: 'query',
      loadable: async (id = 1) => {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const body = await res.json();
        return body;
      }
    });

    const renderStatus = selector({
      key: 'renderStatus',
      get: ({getAtom}) => {
        const { status, result } = getAtom(query);

        switch(status) {
          case 'success':
            return html`Success! ${result.name}`
          case 'error':
            return html`error! :(`
          case 'pending':
          case 'initialized':
            return html`Loading...`
        }
      }
    });

    class MyApp extends LitAtom(LitElement) {
      static selectors = [renderStatus];
      
      connectedCallback() {
        super.connectedCallback();
        setQuery();
      }

      render() {
        return this.renderStatus;
      }
    }

    customElements.define('my-app', MyApp);
  ```

</wcd-snippet>