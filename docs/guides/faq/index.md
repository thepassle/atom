# faq

## Import order

`Cannot access 'myAtom' before initialization`

When sharing Atoms or Selectors that are locally declared in your component, it could be the case that you're trying to import an Atom from another file that has not actually initialized yet.

`my-foo.js` initializes an Atom and exports it:
```js
import {LitElement, html} from 'lit-element';
import { LitAtom, atom } from '@klaxon/atom';
import './my-bar.js';

export const [myAtom, setMyAtom] = atom({
  key: 'atom',
  default: 1
});

class MyFoo extends LitAtom(LitElement) {/* etc*/}
```

`my-bar.js` then tries to import that Atom:
```js
import {LitElement, html} from 'lit-element';
import { LitAtom, atom } from '@klaxon/atom';
import { myAtom } from './my-foo.js';

class MyBar extends LitAtom(LitElement) {/* etc*/}
```

What happens here, however, is that the import for `my-bar.js` occurs _before_ the Atom has been exported, and will cause `myAtom` in `my-bar.js` to result in: `Cannot access 'myAtom' before initialization`. A simple fix for this is to just move the Atom to its own module, and import it in any other modules where it's needed.

Here's more simplified example of exactly what happens here:

`file-a.js`:
```js
import './file-b.js';

export const foo = 'foo';
```

`file-b.js`:
```js
import { foo } from './file-a.js';

console.log(foo); // Cannot access 'foo' before initialization
```

What happens in this case is that `file-a.js` imports `file-b.js`, where `file-b` imports `foo`. However, it tries to log `foo` to the console before it's initialized, because `file-b.js` is imported _before_ `foo` is exported from `file-a.js`.

## Conditionals in Selectors

When you use the `getAtom` or `getSelector` functions in your Selector, you essentially subscribe your Selector to those Atoms/Selectors. It could be the case that you have some conditional logic in your Selector:

```js
const computedVal = selector({
  key: 'computedVal',
  get: ({getAtom}) => {
    const valueA = getAtom(atomA);

    /** 
     * If you return here, the Selector wont subscribe to updates from 
     * valueB until valueA has a value, and can lead to state "lagging" behind
     */ 
    if (!valueA) return 0;
    
    const valueB = getAtom(valueB);

    return valueA + valueB;
  }
});
```

You can still use conditionals in your Selectors, just make sure you move the condition under the Selectors dependencies:

```js
const computedVal = selector({
  key: 'computedVal',
  get: ({getAtom}) => {
    const valueA = getAtom(atomA); 
    const valueB = getAtom(valueB);

    if (!valueA) return 0;
    return valueA + valueB;
  }
});
```

## Update timing

The `LitAtom` Mixin will always make sure an Atom and all of its dependent Selectors have completed executing and updating their values before triggering a component rerender. Since LitElement batches updates asynchronously, and Selectors are async, this can cause multiple renders when you use multiple Selectors in a component. To mitigate this, the `LitAtom` Mixin schedules updates in a task _after_ microtasks have run, and avoid multiple renders.

Consider the following example:

```js
const [num, setNum] = atom({
  key: 'num',
  default: 1
});

const doubleNum = selector({
  key: 'doubleNum',
  get: ({getAtom}) => {
    const number = getAtom(num);
    return number * 2;
  }
});

const doubleNumPlusOne = selector({
  key: 'doubleNumPlusOne',
  get: async ({getSelector}) => {
    const doubleNumber = await getSelector(doubleNum);
    return doubleNumber + 1;
  }
});

class MyApp extends LitAtom(LitElement) {
  static get atoms() {
    return [num];
  }
  
  static get selectors() {
    return [doubleNum, doubleNumPlusOne];
  }

  render() {
    return html`
      <button @click=${() => setNum(old => old + 1)}>increment</button>
      <div>${this.num}</div>
      <div>${this.doubleNum}</div>
      <div>${this.doubleNumPlusOne}</div>
    `
  }
}
```

Clicking the button and updating the `num` Atom will only trigger one rerender for the component:
- user clicks button
- `num` Atom is updated to `2`, notifies its dependencies:
  - the `MyApp` component
  - the `doubleNum` Selector
- `doubleNum` Selector is executed, notifies its dependencies:
  - the `MyApp` component
  - the `doubleNumPlusOne` Selector
- `doubleNumPlusOne` Selector is executed, notifies its dependencies:
  - the `MyApp` component
- the `LitAtom` Mixin schedules a task to update the component, causing the component to rerender

Output:
```html
[ATOM] num: 2
[SELECTOR] doubleNum: 4
[SELECTOR] doubleNumPlusOne: 5
[RERENDER]
```

Since Selectors run async, if we wouldnt have scheduled a task, this would have caused LitElements asynchronous render cycle to have run and completed 3 times; and rendered our component three times where we only needed one.

If you need to `await` when the component has ran all of its Atom/Selector updates (which can be useful in tests for example), you can use the `litAtomUpdateComplete` promise on the element instance:

```js
await this.litAtomUpdateComplete;
```

If you want to opt-out of this behavior, you can override the `scheduleUpdate` method of the `LitAtom` Mixin, and instead call LitElements `this.requestUpdate`:
```js
scheduleUpdate() {
  this.requestUpdate();
}
```

> ⚠️ Be aware, however, that this is not advised and may cause multiple wasteful component renders.

If you're interested in reading more about LitElements asynchronous rendering, you can read more [here](https://medium.com/ing-blog/litelement-a-deepdive-into-batched-updates-b9431509fc4f).