import { isEighteen, isValidCentury, isValidSwedishPIN } from './ssn-validator-utils';

describe('ssn-validator-utils', () => {
  it('should return false for undefined control value', () => {
    expect(isValidSwedishPIN(undefined)).toBe(false);
  });

  it('should return true for undefined or incorrect length', () => {
    expect(isEighteen(undefined)).toBe(true);
    expect(isEighteen('123')).toBe(true);
  });

  it('should isValidCentury perform correctly', () => {
    expect(isValidCentury('181223123123123')).toBeFalsy();
    expect(isValidCentury('191223123123123')).toBeTruthy();
    expect(isValidCentury('201223123123123')).toBeTruthy();
    expect(isValidCentury('211223123123123')).toBeTruthy();
    expect(isValidCentury('221223123123123')).toBeFalsy();
  });
});
