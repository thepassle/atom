<script type="module" src="../../components/wcd-snippet.js"></script>

# Loadable Atom || 3

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