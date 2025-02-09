import { PebDynamicParams } from '@pe/builder/core';

export function evaluate(params: PebDynamicParams | undefined, world: any) {
  if (params === undefined || params === null) {
    return undefined;
  }

  return typeof params === 'string'
    ? evaluateFx(params, world)
    : evaluateDynamicParams(params, world);
};

function evaluateDynamicParams(params: { [key: string]: PebDynamicParams }, world: any) {
  if (params === undefined || params === null) {
    return undefined;
  }

  if (params._ !== undefined) {
    return params._;
  }

  return Object.keys(params).reduce((acc: any, key: string) => {
    acc[key] = evaluate((params as any)[key], world);

    return acc;
  }, {});
}

function evaluateFx(fx: string | undefined, world: any): string | undefined {
  if (fx === undefined) {
    return undefined;
  }

  if (fx.includes('??')) {
    const fields = fx.split('??');
    for (const field of fields) {
      const value = evaluateFx(field, world);

      if (value !== undefined) {
        return value;
      }
    }

    return undefined;
  }

  const names = fx.split('.');
  let value = world;
  for (const name of names) {
    if (value === undefined) {
      return undefined;
    }
    value = value[name];
  }

  return value;
}
