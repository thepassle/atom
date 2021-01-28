import { expect, nextFrame } from '@open-wc/testing';
import { atom, selector } from '../../src/core.js';
import { spy } from 'hanbi';

const [A, setA] = atom({key: 'foo', default: 1});

describe('atoms', () => {
  it('initializes an atom', () => {
    expect(A.key).to.equal('foo');
    expect(A.effects).to.deep.equal([]);
    expect(A.cleanupEffects).to.deep.equal([]);
    expect(A.loadable).to.equal(undefined);
    expect(A.getState()).to.equal(1);
  });

  it('updates the state of an atom', () => {
    expect(A.key).to.equal('foo');
    expect(A.getState()).to.equal(1);
    
    setA(2);
    expect(A.getState()).to.equal(2);

    setA(old => old + 1);
    expect(A.getState()).to.equal(3);
  });

  it('atom accepts function as default', () => {
    const [fn] = atom({key:'fn', default: () => 1});
    expect(fn.key).to.equal('fn');
    expect(fn.getState()).to.equal(1);
  });

  describe('effects', () => {
    it('runs effects', () => {
      const effectA = spy();
      const effectB = spy();
      const [E] = atom({
        key:'effects', 
        default: 1,
        effects: [
          effectA.handler,
          effectB.handler,
        ]
      });
      expect(effectA.callCount).to.equal(1);
      expect(effectB.callCount).to.equal(1);
    });

    it('runs effects when setter fn is called', () => {
      const effectA = spy();
      const effectB = spy();
      const [_, setE] = atom({
        key:'effects2', 
        default: 1,
        effects: [
          effectA.handler,
          effectB.handler,
        ]
      });
      expect(effectA.callCount).to.equal(1);
      expect(effectB.callCount).to.equal(1);
      setE(2);
      expect(effectA.callCount).to.equal(2);
      expect(effectB.callCount).to.equal(2);
    });
  });
});


describe('loadable atoms', () => {
  const [L, setL] = atom({
    key: 'L',
    loadable: async (id = 1) => id + 1
  });

  it('initializes a loadable atom', () => {
    expect(L.key).to.equal('L');
    expect(L.getState()).to.deep.equal({
      status: 'initialized',
      result: null
    });
  });

  it('updates a loadable atom', async () => {
    expect(L.getState()).to.deep.equal({
      status: 'initialized',
      result: null
    });
    setL(2);
    expect(L.getState()).to.deep.equal({
      status: 'loading',
      result: null
    });
    await nextFrame();;
    expect(L.getState()).to.deep.equal({
      status: 'success',
      result: 3
    });
  });

  it('loadable atoms handle errors', async () => {
    const [E, setE] = atom({
      key: 'E',
      loadable: async () => {
        throw new Error('E')
      }
    });

    expect(E.getState().status).to.equal('initialized');
    setE();
    expect(E.getState().status).to.equal('loading');
    await nextFrame();
    expect(E.getState().status).to.equal('error');
  });
});

describe('selectors', async () => {
  const S = await selector({
    key: 'S',
    get: () => 1
  });

  it('initializes a selector', async () => {
    expect(S.key).to.deep.equal('S');
  });

  it('depends on atoms', async () => {
    const [count, setCount] = atom({
      key: 'count',
      default: 1
    });

    const doubleCount = await selector({
      key: 'doubleCount',
      get: ({getAtom}) => {
        const ogCount = getAtom(count);
        return ogCount * 2;
      }
    });

    expect(doubleCount.value).to.equal(2);
    setCount(2);
    await nextFrame();
    expect(doubleCount.value).to.equal(4);
  });
});