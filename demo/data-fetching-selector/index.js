import { LitElement, html, css } from 'lit-element';
import { atom, selector, LitAtom } from '../../index.js';

const [selected, setSelected] = atom({
  key: 'selected',
  default: null
});

const selectedCharacter = selector({
  key: 'selectedCharacter',
  get: async ({getAtom}) => {
    const id = getAtom(selected);

    if(id === null) return null;
    return await (await fetch(`https://swapi.dev/api/people/${id}`)).json();
  }
});

class MyApp extends LitAtom(LitElement) {
  static selectors = [selectedCharacter];
  
  static get properties() {
    return {
      characters: { type: Array }
    }
  }

  async connectedCallback() {
    super.connectedCallback();
    this.characters = (await(await fetch('https://swapi.dev/api/people')).json()).results;
  }

  static styles = css`
    :host {
      display: flex;
      flex-direction: row;
    }

    .characters {
      list-style: none;
    }
  `

  render() {
    return html`
      <div>
        <ul class="characters">
          <h2>Characters:</h2>
          ${this.characters?.map((char, idx) => html`
            <li>${char.name} <button @click=${() => setSelected(idx+1)}>show info</button></li>
          `)}
        </ul>
      </div>
      <div>
        <ul>
          <h2>Character info:</h2>
          <li>name: ${this.selectedCharacter?.name}</li>
          <li>height: ${this.selectedCharacter?.height}</li>
          <li>hair color: ${this.selectedCharacter?.['hair_color']}</li>
          <li>gender: ${this.selectedCharacter?.gender}</li>
        </ul>
      </div>
    `;
  }
}

customElements.define('my-app', MyApp);
