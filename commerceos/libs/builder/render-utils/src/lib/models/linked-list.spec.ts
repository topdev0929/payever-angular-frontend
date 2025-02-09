import { deserializeLinkedList, PebLinkedValue, serializeLinkedList } from './dto';
import { PebLinkedList } from './linked-list';

interface NodeType extends PebLinkedValue{
  data: string;
}

describe('linked-list', () => {
  it('should add to linkedList', () => {
    const linkedList = new PebLinkedList<NodeType>();
    linkedList.add({ id: '1', data: 'data-1', next: null, prev: null });
    linkedList.add({ id: '2', data: 'data-2', next: null, prev: null });
    linkedList.add({ id: '3', data: 'data-3', next: null, prev: null });
    linkedList.add({ id: '4', data: 'data-4', next: null, prev: null });
    linkedList.add({ id: '5', data: 'data-5', next: null, prev: null });
    linkedList.add({ id: '6', data: 'data-6', next: null, prev: null });
    
    expect(linkedList.length).toEqual(6);

    expect(linkedList.head).toBeDefined();
    expect(linkedList.head?.prev).toBeNull();
    expect(linkedList.head?.next?.value.id).toEqual('2');

    expect(linkedList.tail).toBeDefined();
    expect(linkedList.tail?.prev?.value.id).toEqual('5');
    expect(linkedList.tail?.next).toBeNull();

    expect(linkedList.get(0)?.value.data).toEqual('data-1');
    expect(linkedList.get(3)?.value.data).toEqual('data-4');
    expect(linkedList.get(5)?.value.data).toEqual('data-6');
    expect(linkedList.get(6)?.value.data).toBeUndefined();

    linkedList.prepend({ id: '0', data: 'data-0', next: null, prev: null });
    expect(linkedList.get(0)?.value.data).toEqual('data-0');
    expect(linkedList.get(0)?.next?.value.data).toEqual('data-1');
  });

  it('should return undefined when get index out of range',()=>{
    const item1 = { id: '1', data: 'data-1', next: '2', prev: null };
    const item2 = { id: '2', data: 'data-2', next: null, prev: '1' };
    const linkedList = deserializeLinkedList([item1, item2]);
    expect(linkedList.length).toEqual(2);

    expect(linkedList.get(0)).toBeDefined();
    expect(linkedList.get(1)).toBeDefined();

    expect(linkedList.get(2)).toBeUndefined();
    expect(linkedList.get(-1)).toBeUndefined();
    expect(linkedList.get(-10)).toBeUndefined();
    expect(linkedList.get(1000)).toBeUndefined();
    expect(linkedList.get(999000)).toBeUndefined();

    expect(linkedList.length).toEqual(2);
    expect(serializeLinkedList(linkedList)).toEqual([
      { ...item1, next: '2', prev: null },
      { ...item2, next: null, prev: '1' },
    ]);
  });

  it('should serialize/deserialize linkedList', () => {
    const list = [
      { id: '1', data: 'data-1', next: '2', prev: null },
      { id: '2', data: 'data-2', next: '3', prev: '1' },
      { id: '3', data: 'data-3', next: null, prev: '2' },
    ];

    const linkedList = deserializeLinkedList(list);

    expect(linkedList).toBeDefined();
    expect(linkedList.length).toEqual(3);
    expect(linkedList.get(0)?.value).toEqual(list[0]);
    expect(linkedList.get(1)?.value).toEqual(list[1]);
    expect(linkedList.get(2)?.value).toEqual(list[2]);

    const serialized = serializeLinkedList(linkedList);

    expect(serialized).toBeDefined();
    expect(serialized.length).toEqual(3);
    expect(serialized).toEqual(list);
  });

  it('should return contains', () => {
    const item = { id: '1', data: 'data-1', next: null, prev: null };
    const linkedList = new PebLinkedList<NodeType>();
    linkedList.add(item);
    expect(linkedList.contains(item)).toBeTruthy();
    expect(linkedList.contains({ ...item })).toBeFalsy();
    expect(linkedList.contains({} as any)).toBeFalsy();
  });

  it('should return getIndex', () => {
    const item = { id: '1', data: 'data-1', next: null, prev: null };
    const linkedList = new PebLinkedList<NodeType>();
    linkedList.add(item);
    expect(linkedList.getIndex(item)).toEqual(0);
    expect(linkedList.getIndex({ ...item })).toEqual(-1);
  });

  it('should insertAt linkedList', () => {
    const item1 = { id: '1', data: 'data-1', next: '2', prev: null };
    const item2 = { id: '2', data: 'data-2', next: '3', prev: '1' };
    const item3 = { id: '3', data: 'data-3', next: null, prev: '2' };
    
    const linkedList = deserializeLinkedList<NodeType>([item1, item2, item3]);

    const insertA = { id: 'ins-a', data: 'inserted-data-a', next: null, prev: null };
    const insertB = { id: 'ins-b', data: 'inserted-data-b', next: null, prev: null };
    
    expect(linkedList.insertAt(1, insertA)?.value).toEqual(insertA);
    expect(linkedList.insertAt(3, insertB)?.value).toEqual(insertB);
    expect(linkedList.length).toEqual(5);

    expect(serializeLinkedList(linkedList)).toEqual([
      { ...item1, next: 'ins-a', prev: null },
      { ...insertA, next: '2', prev: '1' },
      { ...item2, next: 'ins-b', prev: 'ins-a' },
      { ...insertB, next: '3', prev: '2' },
      { ...item3, next: null, prev: 'ins-b' },
    ]);
  });

  it('should return undefined when insert out of range', () => {
    const item1 = { id: '1', data: 'data-1', next: null, prev: null };
    const linkedList = deserializeLinkedList<NodeType>([item1]);

    const insertA = { id: 'ins-a', data: 'inserted-data-a', next: null, prev: null };

    expect(linkedList.insertAt(-10, insertA)).toBeUndefined();
    expect(linkedList.insertAt(-1, insertA)).toBeUndefined();
    expect(linkedList.insertAt(1000, insertA)).toBeUndefined();

    expect(linkedList.length).toEqual(1);
    expect(serializeLinkedList(linkedList)).toEqual([
      { ...item1, next: null, prev: null },
    ]);
  });

  it('should delete from linkedList', () => {
    const item1 = { id: '1', data: 'data-1', next: '2', prev: null };
    const item2 = { id: '2', data: 'data-2', next: '3', prev: '1' };
    const item3 = { id: '3', data: 'data-3', next: null, prev: '2' };

    const linkedList = deserializeLinkedList([item1, item2, item3]);
    expect(linkedList.length).toEqual(3);

    linkedList.deleteAt(1);
    expect(linkedList.length).toEqual(2);
    expect(linkedList.get(1)?.value).toEqual(item3);
    expect(linkedList.get(1)?.next).toBeNull();
    expect(linkedList.get(1)?.prev?.value).toEqual(item1);

    linkedList.deleteAt(1);
    expect(linkedList.length).toEqual(1);
    expect(linkedList.get(0)?.value).toEqual(item1);
    expect(linkedList.get(0)?.next).toBeNull();
    expect(linkedList.get(0)?.prev).toBeNull();

    linkedList.deleteAt(0);
    expect(linkedList.length).toEqual(0);
  });

  it('should return undefined when delete out of range', () => {
    const item1 = { id: '1', data: 'data-1', next: '2', prev: null };
    const item2 = { id: '2', data: 'data-', next: null, prev: '1' };
    const linkedList = deserializeLinkedList([item1, item2]);
    expect(linkedList.length).toEqual(2);

    expect(linkedList.deleteAt(-10)).toBeUndefined();
    expect(linkedList.deleteAt(-1)).toBeUndefined();
    expect(linkedList.deleteAt(1000)).toBeUndefined();
    expect(linkedList.deleteAt(999000)).toBeUndefined();

    expect(linkedList.length).toEqual(2);
    expect(serializeLinkedList(linkedList)).toEqual([
      { ...item1, next: '2', prev: null },
      { ...item2, next: null, prev: '1' },
    ]);
  });

  it('should shift linkedList', () => {
    const item1 = { id: '1', data: 'data-1', next: '2', prev: null };
    const item2 = { id: '2', data: 'data-2', next: '3', prev: '1' };
    const item3 = { id: '3', data: 'data-3', next: null, prev: '2' };

    const linkedList = deserializeLinkedList([item1, item2, item3]);

    expect(linkedList.length).toEqual(3);

    linkedList.shift();
    expect(linkedList.length).toEqual(2);
    expect(linkedList.get(0)?.value).toEqual(item2);
    expect(linkedList.get(0)?.next?.value).toEqual(item3);
    expect(linkedList.get(0)?.prev).toBeNull();

    expect(linkedList.get(1)?.value).toEqual(item3);
    expect(linkedList.get(1)?.next).toBeNull();
    expect(linkedList.get(1)?.prev?.value).toEqual(item2);

    linkedList.shift();
    linkedList.shift();
    expect(linkedList.length).toEqual(0);

    for (let i = 0; i < 100; i++) {
      linkedList.shift();
    }
    expect(linkedList.length).toEqual(0);
  });

  it('should pop linkedList', () => {
    const item1 = { id: '1', data: 'data-1', next: '2', prev: null };
    const item2 = { id: '2', data: 'data-2', next: '3', prev: '1' };
    const item3 = { id: '3', data: 'data-3', next: null, prev: '2' };

    const linkedList = deserializeLinkedList([item1, item2, item3]);

    expect(linkedList.length).toEqual(3);

    linkedList.pop();
    expect(linkedList.length).toEqual(2);
    expect(linkedList.get(0)?.value).toEqual(item1);
    expect(linkedList.get(0)?.next?.value).toEqual(item2);
    expect(linkedList.get(0)?.prev).toBeNull();

    expect(linkedList.get(1)?.value).toEqual(item2);
    expect(linkedList.get(1)?.next).toBeNull();
    expect(linkedList.get(1)?.prev?.value).toEqual(item1);

    linkedList.pop();
    linkedList.pop();
    expect(linkedList.length).toEqual(0);

    for (let i = 0; i < 100; i++) {
      linkedList.pop();
    }
    expect(linkedList.length).toEqual(0);
  });

});
