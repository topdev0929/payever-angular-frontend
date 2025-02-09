import { round } from './round';


export const sum = (arr: number[]) => arr.reduce((acc, v) => acc + v, 0);

export const splitGrid = (value: number[], count: number, max: number): number[] => {
  const min = 10;
  const [last] = value.slice(-1);
  const items = Array.from({ length: count }, (_, i) => value[i] ?? last);

  let n = items.length;
  while (max / n < min) {
    n -= 1;
  }
  const r = items.slice(0, n);
  let ratio = max / sum(r);
  let result = r.map(v => Math.max(min, round(v * ratio, 2)));
  result.splice(-1, 1, max - sum(result.slice(0, result.length - 1)));

  return result;
};
