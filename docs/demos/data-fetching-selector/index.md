<script type="module" src="../../components/wcd-snippet.js"></script>

# Data fetching Selector || 6

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
      static get selectors() {
        return [selectedPokemon];
      }

      static get properties() {
        return {
          pokemon: { type: Array }
        }
      }

      async connectedCallback() {
        super.connectedCallback();
        this.pokemon = (await (await fetch('https://pokeapi.co/api/v2/pokemon')).json()).results;
      }

      static get styles() {
        return css`
          :host {
            display: flex;
            flex-direction: row;
          }

          .pokemon {
            list-style: none;
          }
        `
      }

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