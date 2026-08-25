import React from 'react';
import { render, screen, within, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider } from '../store/StoreContext';
import HampersPage from './HampersPage';

/* Smoke tests for /hampers. These exist to catch the class of bug unit tests
   can't see, a bad import, a destructure of undefined, a section that throws on
   first render, and to prove the add-to-basket loop actually wires up. */

const renderAt = (path = '/hampers') =>
  render(
    <StoreProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/hampers" element={<HampersPage />} />
          <Route path="/hampers/:occasionSlug" element={<HampersPage />} />
        </Routes>
      </MemoryRouter>
    </StoreProvider>
  );

const basket = () => screen.getByRole('complementary', { name: /your hamper/i });

/* Anchored so it matches the visible slot counter and not the sr-only live region,
   which also ends with "...N of M slots filled." */
const slots = (used, total) => new RegExp(`^${used} of ${total} slots filled`, 'i');

/* Steps 1 and 3 collapse to a summary line. Open one before touching its controls,
   the same way a customer would tap "Change". */
const openStep = (title) => {
  // Not anchored: an open step's header reads "3 Finish it ...", a collapsed one
  // shows a tick instead of the number, so the title is mid-string either way.
  const head = screen.getByRole('button', { name: new RegExp(title, 'i') });
  if (head.getAttribute('aria-expanded') === 'false') fireEvent.click(head);
  return head;
};
const openBox = () => openStep('choose your box');
const openFinish = () => openStep('finish it');

beforeEach(() => {
  window.localStorage.clear();
});

describe('/hampers renders', () => {
  it('renders every section without throwing', () => {
    renderAt();
    expect(screen.getByRole('heading', { level: 1, name: /gift hampers/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /what's the occasion/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /build your own hamper/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /bigger the box/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /hamper questions/i })).toBeInTheDocument();
  });

  it('defaults to the Classic box with an empty basket', () => {
    renderAt();
    const classic = screen.getByRole('radio', { name: /classic/i });
    expect(classic).toHaveAttribute('aria-checked', 'true');
    expect(within(basket()).getByText(slots(0, 5))).toBeInTheDocument();
    expect(within(basket()).getByText(/your box is empty/i)).toBeInTheDocument();
  });

  it('disables the add-to-cart button while the hamper is empty', () => {
    renderAt();
    expect(within(basket()).getByRole('button', { name: /add something first/i })).toBeDisabled();
  });

  it('shows the first discount tier as the next target', () => {
    renderAt();
    expect(within(basket()).getByText(/unlock/i)).toBeInTheDocument();
  });
});

describe('/hampers building a hamper', () => {
  const addFirstProduct = () => {
    const addButtons = screen.getAllByRole('button', { name: /^add .+ to your hamper$/i });
    fireEvent.click(addButtons[0]);
    return addButtons[0];
  };

  it('adds a product to the basket and fills a slot', () => {
    renderAt();
    addFirstProduct();
    expect(within(basket()).getByText(slots(1, 5))).toBeInTheDocument();
    expect(within(basket()).queryByText(/your box is empty/i)).not.toBeInTheDocument();
  });

  it('enables checkout once something is in the box', () => {
    renderAt();
    addFirstProduct();
    expect(within(basket()).getByRole('button', { name: /add hamper to cart/i })).toBeEnabled();
  });

  it('announces the running total to screen readers', () => {
    renderAt();
    addFirstProduct();
    const live = document.querySelector('[aria-live="polite"]');
    expect(live).toHaveTextContent(/hamper total ₹[\d,]+/i);
    expect(live).toHaveTextContent(/1 of 5 slots filled/i);
  });

  it('removes a line again', () => {
    renderAt();
    addFirstProduct();
    const removeBtn = within(basket()).getAllByRole('button', { name: /remove .* from your hamper/i })[0];
    fireEvent.click(removeBtn);
    expect(within(basket()).getByText(slots(0, 5))).toBeInTheDocument();
  });

  it('keeps the draft in localStorage so a reload does not lose it', () => {
    const { unmount } = renderAt();
    addFirstProduct();
    unmount();

    const saved = JSON.parse(window.localStorage.getItem('nj_hamper_v1'));
    expect(saved.lines).toHaveLength(1);
    expect(saved.boxTierId).toBe('classic');

    renderAt();
    expect(within(basket()).getByText(slots(1, 5))).toBeInTheDocument();
  });

  it('trims the hamper when switching to a smaller box', () => {
    renderAt();
    fireEvent.click(screen.getByRole('radio', { name: /grand/i }));

    const addButtons = screen.getAllByRole('button', { name: /^add .+ to your hamper$/i });
    addButtons.slice(0, 5).forEach((b) => fireEvent.click(b));
    expect(within(basket()).getByText(slots(5, 8))).toBeInTheDocument();

    openBox();
    fireEvent.click(screen.getByRole('radio', { name: /petite/i }));
    expect(within(basket()).getByText(slots(3, 3))).toBeInTheDocument();
    // Targeted by text, not role="status", dnd-kit injects its own status live region.
    expect(screen.getByText(/petite holds 3 items, removed the last 2 to fit/i)).toBeInTheDocument();
  });
});

describe('/hampers packing, presentation and notes', () => {
  const liveText = () => document.querySelector('[aria-live="polite"]').textContent;

  const addFirstProduct = () => {
    fireEvent.click(screen.getAllByRole('button', { name: /^add .+ to your hamper$/i })[0]);
  };

  const openPacking = () => {
    const toggle = within(basket()).getAllByRole('button', { name: /^packing for .+/i })[0];
    fireEvent.click(toggle);
    return toggle;
  };

  it('gives a new line its category default packing', () => {
    renderAt();
    addFirstProduct();
    // The first group is Cakes, whose default is the window box.
    expect(within(basket()).getByRole('button', { name: /packing for .*cake box with window/i })).toBeInTheDocument();
  });

  it('shows a packing row in the bill once packing costs something', () => {
    renderAt();
    addFirstProduct();
    expect(within(basket()).getByText(/packing & ribbons/i)).toBeInTheDocument();
  });

  it('changes packing and moves the total', () => {
    renderAt();
    addFirstProduct();
    const before = liveText();

    openPacking();
    fireEvent.click(within(basket()).getByRole('radio', { name: /premium tin \(round\)/i }));

    expect(liveText()).not.toBe(before);
    expect(within(basket()).getByRole('button', { name: /packing for .*premium tin \(round\)/i })).toBeInTheDocument();
  });

  it('offers the cheaper plastic box as an alternative to the default', () => {
    renderAt();
    addFirstProduct();
    openPacking();
    const plastic = within(basket()).getByRole('radio', { name: /basic plastic box/i });
    expect(plastic).toHaveTextContent(/included/i);
  });

  it('adds a ribbon to a single item', () => {
    renderAt();
    addFirstProduct();
    const before = liveText();

    openPacking();
    fireEvent.click(within(basket()).getByRole('checkbox', { name: /satin ribbon/i }));

    expect(liveText()).not.toBe(before);
  });

  it('adds the wooden tray on top of the box tier price', () => {
    renderAt();
    addFirstProduct();
    const before = liveText();

    openFinish();
    fireEvent.click(screen.getByRole('radio', { name: /wooden tray/i }));

    expect(liveText()).not.toBe(before);
    // Named in both the basket header chip and the bill row.
    expect(within(basket()).getAllByText(/classic wooden tray/i).length).toBeGreaterThan(0);
  });

  it('reveals the message field only once a note is chosen', () => {
    renderAt();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

    openFinish();
    fireEvent.click(screen.getByRole('radio', { name: /greeting card/i }));
    const box = screen.getByRole('textbox');
    expect(box).toBeInTheDocument();

    fireEvent.change(box, { target: { value: 'Happy Diwali!' } });
    expect(screen.getByRole('textbox')).toHaveValue('Happy Diwali!');
  });

  it('drops the message when the note is removed again', async () => {
    renderAt();
    openFinish();
    fireEvent.click(screen.getByRole('radio', { name: /custom hand-written note/i }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Some words' } });

    fireEvent.click(screen.getByRole('radio', { name: /no note/i }));
    // The field animates out, so it lingers in the DOM for a frame or two.
    await waitFor(() => expect(screen.queryByRole('textbox')).not.toBeInTheDocument());

    fireEvent.click(screen.getByRole('radio', { name: /greeting tag/i }));
    expect(screen.getByRole('textbox')).toHaveValue('');
  });

  it('persists packing and presentation choices across a reload', () => {
    const { unmount } = renderAt();
    addFirstProduct();
    openPacking();
    fireEvent.click(within(basket()).getByRole('radio', { name: /premium tin \(square\)/i }));
    openFinish();
    fireEvent.click(screen.getByRole('radio', { name: /cane basket/i }));
    unmount();

    const saved = JSON.parse(window.localStorage.getItem('nj_hamper_v1'));
    expect(saved.containerStyleId).toBe('basket');
    expect(saved.lines[0].packingId).toBe('cake-tin-square');

    renderAt();
    expect(within(basket()).getAllByText(/classic cane basket/i).length).toBeGreaterThan(0);
  });
});

describe('/hampers imported add-ons', () => {
  it('groups imported products by type and excludes perishables', async () => {
    renderAt();
    fireEvent.click(screen.getByRole('tab', { name: /imported/i }));

    // The tab panel crossfades, so the new groups arrive a frame later.
    for (const group of ['Soft Drinks', 'Coffee', 'Chocolates', 'Packed Snacks']) {
      // eslint-disable-next-line no-await-in-loop
      expect(await screen.findByRole('heading', { name: new RegExp(group, 'i') })).toBeInTheDocument();
    }
    expect(screen.getByText(/shelf-stable/i)).toBeInTheDocument();
  });

  it('can add an imported item to the hamper', async () => {
    renderAt();
    fireEvent.click(screen.getByRole('tab', { name: /imported/i }));
    const addButtons = await screen.findAllByRole('button', { name: /^add .+ to your hamper$/i });
    fireEvent.click(addButtons[0]);
    expect(within(basket()).getByText(slots(1, 5))).toBeInTheDocument();
  });
});

describe('/hampers builder steps', () => {
  const addFirstProduct = () => {
    fireEvent.click(screen.getAllByRole('button', { name: /^add .+ to your hamper$/i })[0]);
  };
  const stepHead = (title) => screen.getByRole('button', { name: new RegExp(title, 'i') });

  it('starts with the box open and the finishing step folded away', () => {
    renderAt();
    expect(stepHead('choose your box')).toHaveAttribute('aria-expanded', 'true');
    expect(stepHead('finish it')).toHaveAttribute('aria-expanded', 'false');
  });

  it('folds the box step away once the first item is in, showing what was chosen', () => {
    renderAt();
    expect(screen.getByRole('radio', { name: /wooden tray|petite/i })).toBeInTheDocument();

    addFirstProduct();

    const head = stepHead('choose your box');
    expect(head).toHaveAttribute('aria-expanded', 'false');
    expect(head).toHaveTextContent(/classic/i);
    expect(head).toHaveTextContent(/5 slots/i);
    expect(head).toHaveTextContent(/change/i);
  });

  it('reopens the box step on tap and stays open', () => {
    renderAt();
    addFirstProduct();
    const head = stepHead('choose your box');

    fireEvent.click(head);
    expect(stepHead('choose your box')).toHaveAttribute('aria-expanded', 'true');

    // Adding more must not fold it back up: reopening is a deliberate act.
    addFirstProduct();
    expect(stepHead('choose your box')).toHaveAttribute('aria-expanded', 'true');
  });

  it('never collapses the product step', () => {
    renderAt();
    addFirstProduct();
    // Step 2 has no toggle at all, so it is not a button.
    expect(screen.queryByRole('button', { name: /fill it up/i })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /fill it up/i })).toBeInTheDocument();
  });

  it('summarises the finishing choices while folded', () => {
    renderAt();
    const head = stepHead('finish it');
    expect(head).toHaveTextContent(/gift box/i);
    expect(head).toHaveTextContent(/no note/i);

    openFinish();
    fireEvent.click(screen.getByRole('radio', { name: /cane basket/i }));
    fireEvent.click(stepHead('finish it')); // fold it back up

    expect(stepHead('finish it')).toHaveTextContent(/cane basket/i);
  });
});

describe('/hampers shelves', () => {
  it('keeps every ready-made hamper reachable inside the shelf', () => {
    renderAt();
    const shelf = screen.getByRole('group', { name: /ready-made hampers/i });
    // Nine presets, each with its own Add to cart, all still in the DOM.
    expect(within(shelf).getAllByRole('button', { name: /add to cart/i }).length).toBeGreaterThanOrEqual(9);
  });

  it('gives each product category its own shelf', () => {
    renderAt();
    ['Cakes', 'Traditional Sweets', 'Healthy Snacks'].forEach((category) => {
      expect(screen.getByRole('group', { name: new RegExp(`^${category}$`, 'i') })).toBeInTheDocument();
    });
  });

  it('puts the occasions in a shelf too', () => {
    renderAt();
    const shelf = screen.getByRole('group', { name: /occasions/i });
    expect(within(shelf).getByRole('button', { name: /diwali/i })).toBeInTheDocument();
  });
});

describe('/hampers mobile basket', () => {
  const mobileBar = () => screen.getByRole('button', { name: /^open your hamper\./i });

  const addFirstProduct = () => {
    fireEvent.click(screen.getAllByRole('button', { name: /^add .+ to your hamper$/i })[0]);
  };

  it('docks a basket bar even when the hamper is empty', () => {
    renderAt();
    // Always rendered so the box can be watched filling, and so the
    // fly-to-basket animation has a target from the very first tap.
    expect(mobileBar()).toBeInTheDocument();
    expect(mobileBar()).toHaveAccessibleName(/0 of 5 slots filled/i);
    expect(screen.getByText(/tap a product to start/i)).toBeInTheDocument();
  });

  it('keeps the docked bar in step with the hamper', () => {
    renderAt();
    addFirstProduct();
    expect(mobileBar()).toHaveAccessibleName(/1 of 5 slots filled/i);
    expect(within(mobileBar()).getByText(/4 slots left/i)).toBeInTheDocument();
  });

  it('opens and closes the basket sheet', () => {
    renderAt();
    const panel = document.getElementById('nj-hamper-basket-panel');
    expect(panel).not.toHaveClass('is-open');

    fireEvent.click(mobileBar());
    expect(panel).toHaveClass('is-open');

    fireEvent.click(screen.getByRole('button', { name: /close your hamper/i }));
    expect(panel).not.toHaveClass('is-open');
  });

  it('ties a red ribbon onto the product when the ribbon is picked', () => {
    renderAt();
    addFirstProduct();
    expect(document.querySelectorAll('.nj-ribbon-overlay')).toHaveLength(0);

    fireEvent.click(within(basket()).getAllByRole('button', { name: /^packing for .+/i })[0]);
    fireEvent.click(within(basket()).getByRole('checkbox', { name: /satin ribbon/i }));

    // One on the basket slot, one on the docked mobile bar slot.
    expect(document.querySelectorAll('.nj-ribbon-overlay').length).toBeGreaterThan(0);
  });
});

describe('/hampers undo', () => {
  const addFirstProduct = () => {
    fireEvent.click(screen.getAllByRole('button', { name: /^add .+ to your hamper$/i })[0]);
  };
  const undoBtn = () => screen.getByRole('button', { name: /undo last change|nothing to undo/i });

  it('offers no undo at all on a fresh hamper', () => {
    renderAt();
    // Nothing has happened yet, so the whole escape row stays out of the way.
    expect(screen.queryByRole('button', { name: /undo last change|nothing to undo/i })).not.toBeInTheDocument();
  });

  it('offers undo on an emptied hamper, since emptying it is itself undoable', () => {
    renderAt();
    addFirstProduct();
    fireEvent.click(within(basket()).getAllByRole('button', { name: /remove .* from your hamper/i })[0]);

    expect(within(basket()).getByText(slots(0, 5))).toBeInTheDocument();
    expect(undoBtn()).toBeEnabled();
    expect(screen.queryByRole('button', { name: /start over/i })).not.toBeInTheDocument();
  });

  it('takes back an added item', () => {
    renderAt();
    addFirstProduct();
    expect(within(basket()).getByText(slots(1, 5))).toBeInTheDocument();

    fireEvent.click(undoBtn());
    expect(within(basket()).getByText(slots(0, 5))).toBeInTheDocument();
  });

  it('takes back a packing change', () => {
    renderAt();
    addFirstProduct();
    fireEvent.click(within(basket()).getAllByRole('button', { name: /^packing for .+/i })[0]);
    fireEvent.click(within(basket()).getByRole('radio', { name: /premium tin \(round\)/i }));
    expect(within(basket()).getByRole('button', { name: /packing for .*premium tin \(round\)/i })).toBeInTheDocument();

    fireEvent.click(undoBtn());
    expect(within(basket()).getByRole('button', { name: /packing for .*cake box with window/i })).toBeInTheDocument();
  });

  it('takes back a ribbon', () => {
    renderAt();
    addFirstProduct();
    fireEvent.click(within(basket()).getAllByRole('button', { name: /^packing for .+/i })[0]);
    fireEvent.click(within(basket()).getByRole('checkbox', { name: /satin ribbon/i }));
    expect(document.querySelectorAll('.nj-ribbon-overlay').length).toBeGreaterThan(0);

    fireEvent.click(undoBtn());
    expect(within(basket()).getByRole('checkbox', { name: /satin ribbon/i })).not.toBeChecked();
  });

  it('takes back a presentation change', () => {
    renderAt();
    addFirstProduct();
    openFinish();
    fireEvent.click(screen.getByRole('radio', { name: /cane basket/i }));
    expect(within(basket()).getAllByText(/classic cane basket/i).length).toBeGreaterThan(0);

    fireEvent.click(undoBtn());
    expect(within(basket()).getAllByText(/classic gift box/i).length).toBeGreaterThan(0);
  });

  it('brings the whole hamper back after Start over', () => {
    renderAt();
    addFirstProduct();
    addFirstProduct();
    expect(within(basket()).getByText(slots(2, 5))).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /start over/i }));
    expect(within(basket()).getByText(slots(0, 5))).toBeInTheDocument();

    fireEvent.click(undoBtn());
    expect(within(basket()).getByText(slots(2, 5))).toBeInTheDocument();
  });

  it('steps back through several changes in order', () => {
    renderAt();
    addFirstProduct();
    openFinish();
    fireEvent.click(screen.getByRole('radio', { name: /wooden tray/i }));
    openFinish();
    fireEvent.click(screen.getByRole('radio', { name: /greeting card/i }));

    fireEvent.click(undoBtn()); // undo the note
    expect(screen.queryByRole('radio', { name: /no note/i })).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(undoBtn()); // undo the tray
    expect(within(basket()).getAllByText(/classic gift box/i).length).toBeGreaterThan(0);

    fireEvent.click(undoBtn()); // undo the item
    expect(within(basket()).getByText(slots(0, 5))).toBeInTheDocument();
    // Back to the starting state, so the escape row disappears again.
    expect(screen.queryByRole('button', { name: /undo last change|nothing to undo/i })).not.toBeInTheDocument();
  });

  it('does not record every keystroke of the note message', () => {
    renderAt();
    openFinish();
    fireEvent.click(screen.getByRole('radio', { name: /greeting card/i }));
    const box = screen.getByRole('textbox');
    fireEvent.change(box, { target: { value: 'H' } });
    fireEvent.change(box, { target: { value: 'Ha' } });
    fireEvent.change(box, { target: { value: 'Hap' } });

    // One undo should clear the note option itself, not walk back the typing.
    fireEvent.click(undoBtn());
    expect(screen.getByRole('radio', { name: /no note/i })).toHaveAttribute('aria-checked', 'true');
  });
});

describe('/hampers occasion deep links', () => {
  it('preselects the occasion named in the URL', () => {
    renderAt('/hampers/diwali');
    expect(screen.getByRole('button', { name: /diwali/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('heading', { name: /hampers for diwali/i })).toBeInTheDocument();
  });

  it('ignores an unknown occasion slug rather than breaking', () => {
    renderAt('/hampers/not-a-real-occasion');
    expect(screen.getByRole('heading', { name: /ready to gift/i })).toBeInTheDocument();
  });
});
