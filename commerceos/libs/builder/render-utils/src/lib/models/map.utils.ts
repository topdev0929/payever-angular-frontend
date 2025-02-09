import { PebMap } from '@pe/builder/core';

export function toPebMap<T>(items: (T & { id: string })[]): PebMap<T> {
  const res: PebMap<T> = {};
  items?.forEach(item => res[item.id] = item);

  return res;
}