import { PebIndexChangeType } from "@pe/builder/core";
import { getNextIndex } from "./index.utils";

describe('Index Utils', () => {
  it('should get first/last index', () => {
    expect(getNextIndex(0, { type: PebIndexChangeType.First }, 100)).toEqual(0);
    expect(getNextIndex(0, { type: PebIndexChangeType.Last }, 100)).toEqual(99);
  });

  it('should get next/pre index', () => {
    expect(getNextIndex(0, { type: PebIndexChangeType.Next }, 100)).toEqual(1);
    expect(getNextIndex(99, { type: PebIndexChangeType.Next }, 100)).toEqual(99);
    expect(getNextIndex(10, { type: PebIndexChangeType.Prev }, 100)).toEqual(9);
    expect(getNextIndex(0, { type: PebIndexChangeType.Prev }, 100)).toEqual(0);
  });

  it('should get next/pre index with loop', () => {
    expect(getNextIndex(0, { type: PebIndexChangeType.Next, loop: true }, 100)).toEqual(1);
    expect(getNextIndex(99, { type: PebIndexChangeType.Next, loop: true }, 100)).toEqual(0);
    expect(getNextIndex(10, { type: PebIndexChangeType.Prev, loop: true }, 100)).toEqual(9);
    expect(getNextIndex(0, { type: PebIndexChangeType.Prev, loop: true }, 100)).toEqual(99);
  });

  it('should convert number to index', () => {
    expect(getNextIndex(0, { type: PebIndexChangeType.Number, loop: false, number: 1 }, 100)).toEqual(0);
    expect(getNextIndex(0, { type: PebIndexChangeType.Number, loop: false, number: 2 }, 100)).toEqual(1);
    expect(getNextIndex(0, { type: PebIndexChangeType.Number, loop: false, number: 1000 }, 100)).toEqual(99);
  });

  it('should convert number to index with number', () => {
    expect(getNextIndex(0, { type: PebIndexChangeType.Number, loop: true, number: 1 }, 100)).toEqual(0);
    expect(getNextIndex(0, { type: PebIndexChangeType.Number, loop: true, number: 2 }, 100)).toEqual(1);
    expect(getNextIndex(0, { type: PebIndexChangeType.Number, loop: true, number: 1000 }, 100)).toEqual(0);
  });

});