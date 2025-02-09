import { test } from '@jest/globals';

import { evaluate } from './fx.tools';
import { PebDynamicParams } from '@pe/builder/core';


describe('fx tools can evaluate simple dot expressions', () => {
  const cases: { fx?: string, world: any, expected: any }[] = [
    {
      fx: 'id',
      world: { id: 100 },
      expected: 100,
    },
    {
      fx: 'context.id',
      world: { context: { id: 200 } },
      expected: 200,
    },
    {
      fx: 'parent.products.name',
      world: { context: {}, parent: { products: { name: 'product name' } } },
      expected: 'product name',
    },
    {
      fx: undefined,
      world: {},
      expected: undefined,
    },
    {
      fx: 'a.b.c.d.e',
      world: {},
      expected: undefined,
    },
  ];

  test.each(cases)('%s', (item) => {
    expect(evaluate(item.fx, item.world)).toEqual(item.expected);
  });
});

describe('fx tools can evaluate ?? expressions', () => {
  const cases: { fx?: PebDynamicParams, world: any, expected: any }[] = [
    {
      fx: 'id??value.id',
      world: { value: { id: 10 } },
      expected: 10,
    },
    {
      fx: 'context.value??context.id',
      world: { context: { value: 'a', id: 200 } },
      expected: 'a',
    },
    {
      fx: 'context.value??context.id',
      world: { context: { value: 0, id: 200 } },
      expected: 0,
    },
    {
      fx: 'context.value??context.id',
      world: { context: { value: '', id: 200 } },
      expected: '',
    },
    {
      fx: 'context.id??parent.products.name',
      world: { context: {}, parent: { products: { name: 'product name' } } },
      expected: 'product name',
    },
    {
      fx: 'context.id??id',
      world: {},
      expected: undefined,
    },
    {
      fx: 'a??b??c??d',
      world: { d: 1 },
      expected: 1,
    },   
  ];

  test.each(cases)('%s', (item) => {
    expect(evaluate(item.fx, item.world)).toEqual(item.expected);
  });
});

describe('fx tools can evaluate simple dynamic parameters', () => {
  const cases: { params: PebDynamicParams, world: any, expected: any }[] = [
    {
      // simple string
      params: 'id',
      world: { id: 100 },
      expected: 100,
    },
    {
      // simple object
      params: { id: 'context.id', productId: 'urlParameters.contextId' },
      world: { context: { id: 200 }, urlParameters: { contextId: 'some-context-id' } },
      expected: { id: 200, productId: 'some-context-id' },
    },
    {
      // undefined
      params: { a: undefined as any, b: 'context.product.notExists.address.city' },
      world: { context: { product: { address: { city: 'city' } } } },
      expected: { a: undefined, b: undefined },
    },
    {
      // simple object
      params: { address: 'parent.product.address', name: 'parent.product.name', phone: 'parent.product.address.phone' },
      world: { context: {}, parent: { product: { name: 'p name', id: 12, address: { phone: '+123' } } } },
      expected: { address: { phone: '+123' }, name: 'p name', phone: '+123' },
    },
    {
      // nested objects
      params: {
        address: { id: 'context.product.id', select: { default: { contact: 'context.product.address.phone' } } },
      },
      world: { context: { product: { name: 'p name', id: 12, address: { phone: '+123' } } } },
      expected: { address: { id: 12, select: { default: { contact: '+123' } } } },
    },
  ];

  test.each(cases)('%s', (item) => {
    expect(evaluate(item.params, item.world)).toEqual(item.expected);
  });
});

describe('fx tools can evaluate static values', () => {
  const cases: { fx: PebDynamicParams, world: any, expected: any }[] = [
    {
      // static string
      fx: { _: 'simple static string' },
      world: { id: 100, _: 'test' },
      expected: 'simple static string',
    },
    {
      // static number
      fx: { _: 112 },
      world: { id: 100, _: 'test' },
      expected: 112,
    },
    {
      // static object
      fx: { _: { a: 'a', b: 12, c: true } },
      world: { id: 100, _: 'test' },
      expected: { a: 'a', b: 12, c: true },
    },
  ];

  test.each(cases)(`%s`, (item) => {
    expect(evaluate(item.fx, item.world)).toEqual(item.expected);
  });
});

// example 1: 'context.id'
// example 2: SUM(context.id, 1)
// example 3: SUM(context.id, SUM(context.id, 1))
// example 4: root.registerForm.email.value
// example 5: root.environment.business
// example 6: root.urlParameters.contextId
// example 7: root.urlParameters.count + 1
// example 8: MAX(10, context.count)
// example 9: MIN(10, context.count)
// example 10: RBG(255, context.rgb.red, 100)
// example 11: IF(context.count > 10, 10, IF(context.count < 0, 0, context.count))
