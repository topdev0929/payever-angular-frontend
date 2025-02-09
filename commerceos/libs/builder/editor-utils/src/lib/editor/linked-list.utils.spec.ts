import { createLinkedList, getFilteredLinkedList, getLinkedListNextPrev } from './linked-list.utils';

describe('LinkedList utils', () => {
  it('should create linked-list from array', () => {
    const item1 = { id: '1', name: '1' } as any;
    const item2 = { id: '2', name: '2' } as any;
    const item3 = { id: '3', name: '3' } as any;
    const item4 = { id: '4', name: '4' } as any;
    const item5 = { id: '5', name: '5' } as any;

    const linkedList = createLinkedList([item1, item2, item3, item4, item5]);

    expect(linkedList.length).toEqual(5);
    expect(linkedList.head?.value).toEqual(item1);
    expect(linkedList.tail?.value).toEqual(item5);
    expect([...linkedList]).toEqual([item1, item2, item3, item4, item5]);

    expect(getLinkedListNextPrev(linkedList)).toEqual([
      { id: '1', next: '2', prev: null },
      { id: '2', next: '3', prev: '1' },
      { id: '3', next: '4', prev: '2' },
      { id: '4', next: '5', prev: '3' },
      { id: '5', next: null, prev: '4' },
    ]);
  });

  it('should return filtered linked list', () => {
    const item1 = { id: '1', val: 1 } as any;
    const item2 = { id: '2', val: 2 } as any;
    const item3 = { id: '3', val: 3 } as any;
    const item4 = { id: '4', val: 4 } as any;
    const item5 = { id: '5', val: 5 } as any;

    const linkedList = createLinkedList([item1, item2, item3, item4, item5]);

    const filtered = getFilteredLinkedList(linkedList, item => item.val > 1 && item.val < 5);

    expect(getLinkedListNextPrev(filtered)).toEqual([
      { id: '2', next: '3', prev: null },
      { id: '3', next: '4', prev: '2' },
      { id: '4', next: null, prev: '3' },
    ]);
  });

});
