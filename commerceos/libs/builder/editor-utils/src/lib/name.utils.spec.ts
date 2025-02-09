import { toTitleCase } from "./name.utils"

describe('Name utils', () => {
  it('should return title case', () => {
    expect(toTitleCase(undefined)).toEqual('');
    expect(toTitleCase('')).toEqual('');
    expect(toTitleCase('payever')).toEqual('Payever');
    expect(toTitleCase('payever Checkout.')).toEqual('Payever Checkout.');
  });
})