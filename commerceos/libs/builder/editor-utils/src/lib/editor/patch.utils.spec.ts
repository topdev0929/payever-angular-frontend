import { PebElementDef, PebElementDefUpdate } from '@pe/builder/core';
import { PebLinkedList } from '@pe/builder/render-utils';
import { produceWithPatches } from 'immer';
import { addWithPatches, deleteWithPatches, applyDefUpdates, setIndexWithPatches } from './patch.utils';


describe('Patch utils: add/remove to linked list', () => {
  it('should return update for remove from linked-list', () => {
    const list = new PebLinkedList<any>();

    const item1 = { id: '1', name: 'item-1' };
    const item2 = { id: '2', name: 'item-2' };
    const item3 = { id: '3', name: 'item-3' };
    const item4 = { id: '4', name: 'item-4' };

    list.add(item1);
    list.add(item2);
    list.add(item3);
    list.add(item4);

    let serialized = list.serialize();
    expect(serialized[0].next).toEqual('2');
    expect(serialized[1].prev).toEqual('1');
    expect(serialized[1].next).toEqual('3');

    const patches = deleteWithPatches(list, 1);
    expect(patches).toEqual([
      { id: '1', prev: null, next: '3' },
      { id: '3', prev: '1', next: '4' }
    ]);

    serialized = list.serialize();
    expect(serialized[0].next).toEqual('3');
    expect(serialized[0].prev).toEqual(null);
    expect(serialized[1].prev).toEqual('1');
    expect(serialized[1].next).toEqual('4');
  });


  it('should return update for add to linked-list', () => {
    const list = new PebLinkedList<any>();

    const item1 = { id: '1', name: 'item-1' };
    const item2 = { id: '2', name: 'item-2' };
    const item3 = { id: '3', name: 'item-3' };
    const item4 = { id: '4', name: 'item-4' };

    list.add(item1);
    list.add(item2);
    list.add(item3);
    list.add(item4);

    let serialized = list.serialize();
    expect(serialized[3].next).toEqual(null);
    expect(serialized[3].prev).toEqual('3');

    const patches = addWithPatches(list, { id: '5', name: 'item-5' });

    expect(patches).toEqual([
      { id: '4', prev: '3', next: '5' },
      { id: '5', prev: '4', next: null }
    ]);

    serialized = list.serialize();
    expect(serialized[3].next).toEqual('5');
    expect(serialized[3].prev).toEqual('3');
  });
})

describe('Patch utils: get update element def callback', () => {
  it('should modify draft for pebElementDef', () => {

    const defs: { [id: string]: PebElementDef } = {
      'id-1': {
        id: 'id-1',
        type: 'shape',
        nex: null,
        prev: 'prev-1',
        styles: {
          desktop: {
            fill: {
              mode: 'image',
              color: 'green',
            },
            position: {
              left: {
                unit: 'px',
                value: 100,
              },
              right: 200,
            },
            visibility: 'hidden'
          }
        }
      },
      'id-2': {
        id: 'id-2',
        type: 'shape',
        next: 'next-2',
        prev: 'prev-2',
      },
    } as any;

    const updates: PebElementDefUpdate[] = [
      { id: 'id-1', styles: { desktop: { fill: { color: 'yellow' }, visibility: undefined } }, type: 'new-type' },
      { ...defs['id-2'], type: 'section' },
    ] as any;

    const [updated, patches] = produceWithPatches(defs, (draft) => {
      applyDefUpdates(draft, updates);
    });

    expect(updated['id-1'].type).toEqual('new-type');
    expect(updated['id-1'].styles.desktop.fill).toEqual({ mode: 'image', color: 'yellow' });
    expect(updated['id-2']).toEqual({ ...updated['id-2'], type: 'section' });

    expect(patches[0]).toEqual({ op: 'replace', path: ['id-1', 'styles', 'desktop', 'fill', 'color'], value: 'yellow' });
    expect(patches[1]).toEqual({ op: 'remove', path: ['id-1', 'styles', 'desktop', 'visibility'] });
    expect(patches[2]).toEqual({ op: 'replace', path: ['id-1', 'type'], value: 'new-type' });
    expect(patches[3]).toEqual({ op: 'replace', path: ['id-2', 'type'], value: 'section' });
  });

  it('should return update for move from linked-list', () => {
    const list = new PebLinkedList<any>();

    const item1 = { id: '1', name: 'item-1' };
    const item2 = { id: '2', name: 'item-2' };
    const item3 = { id: '3', name: 'item-3' };
    const item4 = { id: '4', name: 'item-4' };

    list.add(item1);
    list.add(item2);
    list.add(item3);
    list.add(item4);

    const patches = setIndexWithPatches(list, 1, 2);
    expect(patches).toEqual([
      { id: '1', prev: null, next: '3' },
      { id: '3', prev: '1', next: '2' },
      { id: '2', prev: '3', next: '4' },
      { id: '4', prev: '2', next: null }
    ]);
  });

  it('should return only updated for move from linked-list', () => {
    const list = new PebLinkedList<any>();

    const item1 = { id: '1', name: 'item-1' };
    const item2 = { id: '2', name: 'item-2' };
    const item3 = { id: '3', name: 'item-3' };
    const item4 = { id: '4', name: 'item-4' };

    list.add(item1);
    list.add(item2);
    list.add(item3);
    list.add(item4);

    const patches = setIndexWithPatches(list, 0, 1);
    expect(patches).toEqual([
      { id: '2', prev: null, next: '1' },
      { id: '1', prev: '2', next: '3' },
      { id: '3', prev: '1', next: '4' },
    ]);
  });
});
