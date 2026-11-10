import { packCloset, preferredZone, segmentKinds, tileCountFor } from '../closet/closetPacking';
import { CLOSET_SCENES, closetSceneFor } from '../closet/closetSlots';

type Piece = { id: string; category: string };
const piece = (id: string, category: string): Piece => ({ id, category });
const garments = (layout: ReturnType<typeof packCloset<Piece>>) =>
  layout.flatMap((segment) =>
    segment.placed.flatMap((p) => (p.content.kind === 'garment' ? [{ id: p.content.item.id, zone: p.slot.zone, segment: segment.index }] : [])),
  );

describe('closet scenes', () => {
  it('picks the men’s closet for male users and the women’s for everyone else', () => {
    expect(closetSceneFor('male')).toBe(CLOSET_SCENES.male);
    expect(closetSceneFor('female')).toBe(CLOSET_SCENES.female);
    expect(closetSceneFor(null)).toBe(CLOSET_SCENES.female);
  });

  describe.each(Object.entries(CLOSET_SCENES))('%s slots', (_name, scene) => {
    it('keeps every slot inside its image, below the rod', () => {
      for (const slots of Object.values(scene.slots)) {
        for (const s of slots) {
          expect(s.x - s.w / 2).toBeGreaterThanOrEqual(0);
          expect(s.x + s.w / 2).toBeLessThanOrEqual(1);
          expect(s.y - s.h / 2).toBeGreaterThan(scene.rodY);
          expect(s.y + s.h / 2).toBeLessThanOrEqual(1);
        }
      }
    });

    it('starts the left panel with a rod slot (for Add a Piece)', () => {
      expect(scene.slots.left[0].zone).toBe('rod');
    });

    it('places every piece exactly once for any wardrobe size', () => {
      for (const count of [1, 14, 15, 16, 40, 61]) {
        const items = Array.from({ length: count }, (_, i) => piece(`p${i}`, i % 3 === 0 ? 'dress' : 'trousers'));
        const ids = garments(packCloset(items, scene.slots)).map((p) => p.id);
        expect(new Set(ids).size).toBe(count);
      }
    });
  });
});

const slots = CLOSET_SCENES.female.slots;

describe('tileCountFor / segmentKinds', () => {
  it('uses one tile minimum and one more per tile’s worth of pieces', () => {
    expect(tileCountFor(0, 15)).toBe(1);
    expect(tileCountFor(15, 15)).toBe(1);
    expect(tileCountFor(16, 15)).toBe(2);
    expect(segmentKinds(2)).toEqual(['left', 'tile', 'tile', 'right']);
  });
});

describe('packCloset', () => {
  it('puts Add a Piece in the first rod slot of the left panel, even when empty', () => {
    const layout = packCloset([], slots);
    expect(layout).toHaveLength(3);
    expect(layout[0].placed).toEqual([{ slot: slots.left[0], key: '0-0', content: { kind: 'add' } }]);
  });

  it('hangs outerwear and dresses, shelves tops on shelf1 and bottoms on shelf2', () => {
    expect(preferredZone('long_sleeved_outwear')).toBe('rod');
    const placed = garments(
      packCloset([piece('t', 'short_sleeved_shirt'), piece('d', 'dress'), piece('b', 'trousers'), piece('o', 'long_sleeved_outwear')], slots),
    );
    expect(Object.fromEntries(placed.map((p) => [p.id, p.zone]))).toEqual({ t: 'shelf1', d: 'rod', b: 'shelf2', o: 'rod' });
  });

  it('overflows a full zone into the next free slot of any zone, without taking later categories’ room', () => {
    const rodSlotsLeft = slots.left.filter((s) => s.zone === 'rod').length - 1; // minus Add a Piece
    const dresses = Array.from({ length: rodSlotsLeft + 1 }, (_, i) => piece(`d${i}`, 'dress'));
    const placed = garments(packCloset([...dresses, piece('t', 'short_sleeved_shirt')], slots, 1));
    expect(placed.filter((p) => p.zone === 'rod')).toHaveLength(dresses.length);
    expect(placed.find((p) => p.id === 't')).toMatchObject({ zone: 'shelf1', segment: 0 });
  });
});
