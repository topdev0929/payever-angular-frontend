import { KeysToCamelCase } from '@pe/checkout/types';

export function camelCase<T extends object | string>(object: T): KeysToCamelCase<T> {
  return Object.entries(object || {}).reduce((acc, [k, v]) => {
    let value = v;
    if (v && Array.isArray(v)) {
      value = v.reduce((acc, el) => {
        acc.push(camelCase(el));

        return acc;
      }, []);
    } else if (v && typeof v === 'object') {
      value = camelCase(v);
    }

    const key = k.split(/(?!^_)_/g)
     .filter(Boolean)
     .map((w, i) => !!i && !!w ? w[0].toUpperCase() + w.slice(1) : w).join('');
    acc[key] = value;

    return acc;
  }, {} as any);
 }
