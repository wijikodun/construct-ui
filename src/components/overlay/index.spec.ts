import m from 'mithril';
import assert from 'assert';
import { Overlay, IOverlayAttrs, Classes, Input, Keys } from '@/';
import { hasClass, hasChildClass, TIMEOUT } from '@test-utils';

describe('overlay', () => {
  const portal = () => document.body.querySelector(`.${Classes.PORTAL}`) as HTMLElement;
  const overlay = () => document.body.querySelector(`.${Classes.OVERLAY}`) as HTMLElement;

  afterEach(() => {
    document.body.innerHTML = '';
    m.mount(document.body, null);
  });

  it('Renders correctly', () => {
    mount({
      class: Classes.POSITIVE,
      style: 'color: red'
    });

    assert(hasClass(overlay(), Classes.POSITIVE));
    assert.equal(overlay().style.color, 'red');
  });

  it('Renders portal correctly', () => {
    mount({});

    assert(hasClass(portal(), Classes.PORTAL));
  });

  it('Passes through attrs to portal', () => {
    mount({
      portalAttrs: {
        class: Classes.POSITIVE,
        style: 'color: red'
      }
    });

    assert(hasClass(portal(), Classes.POSITIVE));
    assert.equal(portal().style.color, 'red');
  });

  it('Renders children', () => {
    mount({ content: 'content' });

    assert(overlay().innerHTML.includes('content'));
  });

  it('Renders inline', () => {
    mount({ inline: true });

    assert(!portal());
  });

  it('Has backdrop by default', () => {
    mount({});

    assert(hasChildClass(overlay(), Classes.OVERLAY_BACKDROP));
  });

  it('Sets backdrop class', () => {
    mount({
      backdropClass: Classes.POSITIVE
    });

    const backdrop = overlay().querySelector(`.${Classes.OVERLAY_BACKDROP}`) as HTMLElement;

    assert(hasClass(backdrop, Classes.POSITIVE));
  });

  it('Sets autofocus', () => {
    mount({
      content: m(Input, { autofocus: true })
    });

    const input = overlay().querySelector('input');

    assert(input.autofocus);
  });

  it('hasBackdrop=false hides backdrop', () => {
    mount({ hasBackdrop: false });

    const backdrop = overlay().querySelector(`.${Classes.OVERLAY_BACKDROP}`);
    assert(!backdrop);
  });

  it('closeOnOutsideClick=true invokes onClose', () => {
    let count = 0;

    mount({
      closeOnOutsideClick: true,
      onClose: () => count++
    });

    const backdrop = overlay().querySelector(`.${Classes.OVERLAY_BACKDROP}`);
    backdrop.dispatchEvent(new Event('mousedown'));

    assert.equal(count, 1);
  });

  it('Handles closeOnEscapeKey', () => {
    let count = 0;

    mount({
      onClose: () => count++,
      closeOnEscapeKey: true
    });

    document.dispatchEvent(new KeyboardEvent('keydown', {
      which: Keys.ESCAPE
    } as any));

    assert.equal(count, 1);
  });

  // TODO: overlay lifecycle callbacks
  it('Handles lifecycle callbacks', done => {
    let count = 0;

    const component = mount({
      onOpened: () => count++,
      onClosed: () => count++
    });

    setTimeout(() => {
      component.isOpen = false;
      m.redraw();
      assert.equal(count, 2);
      done();
    }, TIMEOUT);
  });

  function mount(attrs: IOverlayAttrs) {
    const component = {
      isOpen: true,
      view: (vnode: any) => m(Overlay, {
        addToStack: false,
        isOpen: vnode.state.isOpen,
        transitionDuration: 0,
        ...attrs
      })
    };

    m.mount(document.body, component);
    return component;
  }
});
