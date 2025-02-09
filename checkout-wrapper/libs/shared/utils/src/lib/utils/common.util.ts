export function isEqual(objA: any, objB: any): boolean {
  if (typeof objA !== typeof objB) {
    return false;
  }

  if (objA === null || objB === null || objA === undefined || objB === undefined) {
    return objA === objB;
  }

  if (Array.isArray(objA) && Array.isArray(objB)) {
    if (objA.length !== objB.length) {
      return false;
    }

    for (let i = 0; i < objA.length; i++) {
      if (!isEqual(objA[i], objB[i])) {
        return false;
      }
    }

    return true;
  }

  if (typeof objA === 'object' && typeof objB === 'object') {
    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);

    if (keysA.length !== keysB.length) {
      return false;
    }

    for (const key of keysA) {
      if (!keysB.includes(key) || !isEqual(objA[key], objB[key])) {
        return false;
      }
    }

    return true;
  }

  return objA === objB;
}

export function cloneDeep<T>(source: T): T {
  if (source === null || typeof source !== 'object') {
    return source;
  }

  if (Array.isArray(source)) {
    return source.map((item: any) => cloneDeep(item)) as T;
  }

  const clonedObj: any = {};
  Object.keys(source).forEach((key) => {
    clonedObj[key] = cloneDeep(source[key as keyof T]);
  });

  return clonedObj;
}

type PlainObject = Record<string, any>;

export function isPlainObject(obj: any): obj is PlainObject {
  if (typeof obj !== 'object' || obj === null || Object.prototype.toString.call(obj) !== '[object Object]') {
    return false;
  }

  const prototype = Object.getPrototypeOf(obj);

  return prototype === null || prototype === Object.prototype;
}

export function isEmpty(value: any): boolean {
  if (value == null) {
    return true;
  }

  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.length === 0;
    }

    return Object.keys(value).length === 0;
  }

  return !value;
}
