import { selector } from '../../../index.js';
import { todos } from '../atoms/index.js';

export const todosList = selector({
  key: 'todosList',
  get: ({getAtom}) => {
    const list = getAtom(todos);
    return Object.values(list).map(([todoAtom]) => todoAtom.getState());
  }
});
