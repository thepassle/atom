import { LitElement, html, css } from "lit-element";
import { LitAtom, atom, selector } from "../../index.js";

const initialState = {count: 0};

// const [count, dispatch] = atom({
//   key: 'count',
//   default: initialState,
//   reducer: (state, action) => {
//     switch (action.type) {
//       case 'increment':
//         return {count: state.count + 1};
//       case 'decrement':
//         return {count: state.count - 1};
//       default:
//         throw new Error();
//     }
//   }
// });

// dispatch({type: 'increment',});


const [state, setState] = atom({
  key: 'state',
  default: {count: 0}
});

// const dispatch = (action) => {
//   switch (action.type) {
//     case 'increment':
//       setState(state => ({count: state.count + 1}));
//       break;
//     case 'decrement':
//       setState(state => ({count: state.count - 1}));
//       break;
//     default:
//       throw new Error();
//   }
// };

const dispatch = (action) => {
  setState(state => {
    switch (action.type) {
      case 'increment':
        return {count: state.count + 1};
      case 'decrement':
        return {count: state.count + -1};
      default:
        return state;
    }
  });
}


// const doubleCount = selector({
//   key: 'doubleCount',
//   get: ({getAtom}) => {
//     console.log('### 👍 [DOUBLE]')
//     const ogCount = getAtom(count);
//     return ogCount * 2;
//   }
// });

// const doubleCountPlusTen = selector({
//   key: 'doubleCountPlusTen',
//   get: async ({getSelector}) => {
//     console.log('### 👍 [PLUS TEN]')
//     const double = await getSelector(doubleCount);
//     return double + 10;
//   }
// });

// export class MyApp extends LitElement {
//   render() {
//     return html`
//       <my-atom></my-atom>
//       <my-selector></my-selector>
//     `
//   }
// }
// customElements.define('my-app', MyApp)

export class MyAtom extends LitAtom(LitElement) {
  static atoms = [state];

  render() {
    return html`
      count: ${this.state.count}
      <button @click=${() => dispatch({type: 'increment'})}>inc</button>
      <button @click=${() => dispatch({type: 'decrement'})}>inc</button>
    `;
  }
}

customElements.define("my-app", MyAtom);

// export class MySelector extends LitAtom(LitElement) {
//   static selectors = [doubleCountPlusTen];

//   render() {
//     return html`
//     <div>
//       doubleCountPlusTen: ${this.doubleCountPlusTen}
//     </div>
//     <button @click=${()=>{setCount(old => old + 1)}}>click</button>
//     `;
//   }
// }

// customElements.define("my-selector", MySelector);
