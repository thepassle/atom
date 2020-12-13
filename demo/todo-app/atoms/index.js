import { atom } from '../../../index.js';

export const [todos, setTodos] = atom({
  key: 'todos',
  default: {}
});