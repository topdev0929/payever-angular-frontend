import { PebSize, isAutoOrUndefined, isPixelSize } from '@pe/builder/core';

export function calculateScrollBoundValue(
  scrollTop: number,
  targetPosition: { top: number; height: number },
  startOffset?: PebSize,
  endOffset?: PebSize,
): number {
  let height = targetPosition.height;
  let targetTop = targetPosition.top;

  const start = toPixelSize(startOffset, height);
  const end = isAutoOrUndefined(endOffset) ? height : toPixelSize(endOffset, height);
  height = end - start;
  if (height === 0) {
    return 0;
  }

  const distance = scrollTop - targetTop - start;
  let top = Math.min(Math.max(0, distance), height);

  return top / height;
}

function toPixelSize(size: PebSize | undefined, max: number): number {
  if (isAutoOrUndefined(size) || !size?.value) {
    return 0;
  }

  return isPixelSize(size)
    ? size.value
    : max * (size.value / 100);
}