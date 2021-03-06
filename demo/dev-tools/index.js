import { LitElement, html, css } from "lit-element";
import { registerDevtools, LitAtom, atom, selector } from "../../index.js";


registerDevtools();


const [count, setCount] = atom({
  key: 'count',
  default: 0,
});

const [obj, setObj] = atom({
  key: 'obj',
  default: {state: 0},
});

const [loadable, initLoadable] = atom({
  key: 'loadable',
  loadable: async () => {
    await new Promise(res => setTimeout(res, 1500));
    return "loadable done! 🎉";
  }
})

const doubleCount = selector({
  key: 'doubleCount',
  get: ({getAtom}) => {
    const cnt = getAtom(count);
    return cnt * 2;
  }
});

const doubleCountPlusTen = selector({
  key: 'doubleCountPlusTen',
  get: async ({getSelector}) => {
    const cnt = await getSelector(doubleCount);
    return cnt + 10;
  }
});

// console.log(atoms);

setCount(1);
// setCount(2);

// console.log(selectors);

class Test extends LitAtom(LitElement) {
  static atoms = [count, obj, loadable];
  static selectors = [doubleCount, doubleCountPlusTen];

  connectedCallback() {
    super.connectedCallback();
    initLoadable();
  }

  render() {
    return html`
      <button @click=${() => {setCount(old => old + 1)}}>click</button>
      <div>count: ${this.count}</div>
      <br>
      <br>
      <div>doubleCount: ${this.doubleCount}</div>
      <br>
      <br>
      <div>doubleCountPlusTen: ${this.doubleCountPlusTen}</div>
      <br>
      <br>
      <button @click=${() => {setObj(old => ({state: old.state + 1}))}}>click</button>  
      <div>obj: ${JSON.stringify(this.obj, null, 2)}</div>
      <br>
      <br>
      <div>loadable: ${JSON.stringify(this.loadable, null, 2)}</div>
      ${this.loadable.status === 'loading'
        ? html`<img width=40 src="https://i.giphy.com/media/sSgvbe1m3n93G/giphy.webp"/>`
        : ''
      }
      ${this.loadable.status === 'success'
        ? html`${this.loadable.result}`
        : ''
      }
      
      <br>
      <br>
    `
  }
}

customElements.define('my-test', Test);