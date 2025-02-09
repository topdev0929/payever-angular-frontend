import { PebIndexChange, PebIndexChangeType } from '@pe/builder/core';


export function getNextIndex(
  currentIndex: number,
  change: PebIndexChange | undefined,
  length: number | undefined,
): number {
  if (!length) {
    return -1;
  }

  const max = length - 1;
  const { type, loop, number } = change ?? { type: PebIndexChangeType.Next, loop: false, number: 1 };

  if (type === PebIndexChangeType.First) {
    return 0;
  }
  if (type === PebIndexChangeType.Last) {
    return max;
  }

  let delta: -1 | 1 | 0;
  if (type === PebIndexChangeType.Prev) {
    delta = -1;
  } else if (type === PebIndexChangeType.Next) {
    delta = +1;
  } else {
    delta = 0;
  }
  let newIndex = type === PebIndexChangeType.Number
    ? (number ?? 0) - 1
    : (currentIndex ?? 0) + delta;

  if (!loop) {
    return Math.max(0, Math.min(max, newIndex));
  }
  if (newIndex < 0) {
    return max;
  }
  if (newIndex > max) {
    return 0;
  }

  return newIndex;
}
