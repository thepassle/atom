import { expect, fixture } from '@open-wc/testing';
import { LitElement } from 'lit-element';
import { LitAtom } from '../../integrations/lit.js';
import { atom, selector } from '../../src/core.js';
import { AtomLitElement } from '../../integrations/lit-auto.js';

const [count, setCount] = atom({
  key: 'count',
  default: 1
});

class BasicAtom extends LitAtom(LitElement) {
  static atoms = [count];
}
customElements.define('basic-atom', BasicAtom);

class AutomaticAtom extends AtomLitElement {
  render() {
    return html`${count.getState()}`;
  }
}
customElements.define('automatic-atom', AutomaticAtom);

describe('lit', () => {
  describe('auto', () => {
    let el;

    beforeEach(() => {
      el = await fixture('<automatic-atom></automatic-atom>');
    });

    afterEach(() => {
      el.remove();
    });

    it('initializes correctly', () => {
      expect(el.shadowRoot.textContent).to.equal('1');
    });

    it('updates correctly with `setCount`', async () => {
      setCount(old => old + 1);
      await el.updateComplete;
      expect(el.shadowRoot.textContent).to.equal('2');
    });
  });

  describe('atoms', () => {
    it('initializes correctly', async () => {
      const el = await fixture('<basic-atom></basic-atom>');
      expect(el.count).to.equal(1);
    });
  
    it('updates correctly with `this.updateAtom`', async () => {
      const el = await fixture('<basic-atom></basic-atom>');
      el.updateAtom(count, 2);
      expect(el.count).to.equal(2);
    });
  
    it('updates correctly with `setCount`', async () => {
      const el = await fixture('<basic-atom></basic-atom>');
      setCount(old => old + 1);
      expect(el.count).to.equal(3);
    });
  });

  describe('selectors', () => {
    const doubleCount = selector({
      key: 'doubleCount',
      get: ({getAtom}) => {
        const ogCount = getAtom(count);
        return ogCount * 2;
      }
    });

    const doubleCountPlusTen = selector({
      key: 'doubleCountPlusTen',
      get: async ({getSelector}) => {
        const double = await getSelector(doubleCount);
        return double + 10;
      }
    });

    class BasicSelector extends LitAtom(LitElement) {
      static selectors = [doubleCount];
    }
    customElements.define('basic-selector', BasicSelector);

    class NestedSelector extends LitAtom(LitElement) {
      static selectors = [doubleCountPlusTen];
    }
    customElements.define('nested-selector', NestedSelector);

    class MultipleSelector extends LitAtom(LitElement) {
      static selectors = [doubleCount, doubleCountPlusTen];
    }
    customElements.define('multiple-selector', MultipleSelector);

    beforeEach(() => {
      setCount(1);
    });

    it('initializes correctly', async () => {
      const el = await fixture('<basic-selector></basic-selector>');
      expect(el.doubleCount).to.equal(2);
    });

    it('handles nested selectors correctly', async () => {
      const el = await fixture('<nested-selector></nested-selector>');
      expect(el.doubleCountPlusTen).to.equal(12);
    });

    it('handles update timing for multiple selectors correctly', async () => {
      const el = await fixture('<multiple-selector></multiple-selector>');
      await el.litAtomUpdateComplete;
      expect(el.doubleCountPlusTen).to.equal(12);
    });
  });
});

