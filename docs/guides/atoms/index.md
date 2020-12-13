# Atoms || 1

## Introduction

Atoms represent small pieces of reusable and shareable state, and maintain their own internal stores. Atoms represent small pieces of reusable state, and maintain their own internal store. Whenever an update is triggered (by calling the setter function of that Atom), the Atoms store dispatches an event. All components (and Selectors) that are subscribed to that Atom will get the event, trigger an update, and cause only the relevant components to update and rerender.

```js
import { atom } from '@klaxon/atom';

const [count, setCount] = atom({
  key: 'count',
  default: 1
});

console.log(count.getState()); // 1

setCount(2);

setCount(old => old + 1);

console.log(count.getState()); // 3
```

An Atoms `default` value can be a boolean, number, string, array, object or a function.

```js
const [list, setList] = atom({
  key: 'list',
  default: [{text: 'hello!'}]
});

setList((old) => [...old, {text: 'bye!'}]);

console.log(list.getState()); // [{text: 'hello'}, {text: 'bye!}]
```

```js
const [obj, setObj] = atom({
  key: 'obj',
  default: {text: 'hello!', age: 20}
});

setObj((old) => ({...old, age: 30}));

console.log(obj.getState()); // {text: 'hello!', age: 30}
```

Etcetera.

## Registering Atoms

You can apply an Atom to your component by adding it to the static `atoms` getter, and using the `LitAtom` Mixin:

```js
class MyCounter extends LitAtom(LitElement) {
  static get atoms() {
    return [count];
  }

  render() {
    return html`
      <h1>count: ${this.count}</h1>
      <button @click=${() => setCount(old => old + 1)}>increment</button>
      <button @click=${() => setCount(old => old - 1)}>decrement</button>
    `;
  }
}
```

> Note that it's not required to add `doubleCount` to LitElements static `properties` getter. It's still fine to do however if, for example, you want to access the value during LitElements lifecycle callbacks, like `updated`.

The `LitAtom` mixin will subscribe to any changes for the `num` Atom, and rerender your component. You can access the value of the `num` Atom in your component like so: `this.num` (👈 the `key` value of the Atom).

## Updating Atoms

When you initialize a new Atom, you also get an _update_, or _setter_ function. You can either set the value directly, or pass it a callback. The callback is given the previous state as argument, so you can modify the old state as you please and then return the new state.

```js
import { atom } from '@klaxon/atom';

const [count, setCount] = atom({
  key: 'count',
  default: 1
});

// Sets the value directly
setCount(2);

// Gets a function with as parameter the previous state
setCount(old => old + 1);
```

### Updating Atoms with the `LitAtom` Mixin

If you're using the `LitAtom` Mixin, you can also call `this.updateAtom`. `updateAtom` takes an Atom, and either a value or a function.

```js
class MyCounter extends LitAtom(LitElement) {
  static get atoms() {
    return [count];
  }

  render() {
    return html`
      <h1>count: ${this.count}</h1>
      <button @click=${() => this.updateAtom(count, old => old + 1)}>increment</button>
      <button @click=${() => this.updateAtom(count, old => old - 1)}>decrement</button>
    `;
  }
}
```

## Effects

> ⚠️ This is an experimental API, and may be renamed to `middlewares` in the future.

Atoms may also have an optional array of `effects`, which can be useful for running side effects any time your Atom changes, like logging for example. You can optionally return a _cleanup_ function from your effect which will run whenever your component disconnects from the DOM.

```js
const [count, setCount] = atom({
  key: 'count',
  default: 1,
  effects: [
    () => {
      console.log('Im logged any time `count` changes!');
      return () => {
        console.log('Im logged whenever components that subscribe to this atom disconnect!');
      }
    }
  ]
});
```

## Parameterized Atoms

If you need to create Atoms dynamically or create Atoms based on parameters, you can wrap the atom in a function:

```js
const createTodo = id => atom({
  key: `todo-${id}`,
  default: { id, text: "", isComplete: false },
});

const [todo, setTodo] = createTodo(1);
```

## Async Atoms

You can also use Atoms for fetching data, or doing asynchronous work.

```js
const [query, setQuery] = atom({
  key: 'query',
  // you can optionally use a default parameter
  loadable: async (id = 1) => {
    const res = await fetch(`https://swapi.dev/api/people/${id}`);
    const body = await res.json();
    return body;
  }
});
```

> Note that if you use the `loadable` functionality, you can't set a `default`.

This Atoms store will be an object that looks like this:

```js
{
  status: "pending",
  result: {}
}
```

A `loadable` Atoms `status` can either be:
- `"pending"` 
- `"success"` 
- `"error"` 

Whenever the status of the `loadable` promise changes (on success or on error), the Atom will notify itself and trigger an update in your component or any Selectors that may depend on it.
The `result` property will be populated with the return value of the `loadable` promise, or, in case of error; the error.

### Usage in components:

You can use a loadable Atom in your components like this:

```js
class MyApp extends LitAtom(LitElement) {
  static get atoms() {
    return [query];
  }

  render() {
    switch(this.query.status) {
      case 'success':
        return html`Success! ${this.query.result.name}`
      case 'error':
        return html`error! :(`
      case 'pending':
        return html`Loading...`
    }
  }
}
```

### Updating loadable Atoms

You can retrigger loadable Atoms with the setter function returned from the Atom.

```js
setQuery(2);

// or `await` it
await setQuery(2);
```

### Combining loadable Atoms with Selectors

You can also combine loadable Atoms with Selectors. Whenever the `status` of the loadable Atom changes, the Selector is run.

```js
const [query, setQuery] = atom({
  key: 'query',
  loadable: async (id = 1) => {
    const res = await fetch(`https://swapi.dev/api/people/${id}`);
    const body = await res.json();
    return body;
  }
});

const renderStatus = selectors({
  key: 'renderStatus',
  get: ({getAtom}) => {
    const { status, result } = getAtom(query);

    switch(status) {
      case 'success':
        return html`Success! ${result.name}`
      case 'error':
        return html`error! :(`
      case 'pending':
        return html`Loading...`
    }
  }
});

class MyApp extends LitAtom(LitElement) {
  static get selectors() {
    return [renderStatus];
  }

  render() {
    return this.renderStatus;
  }
}
```