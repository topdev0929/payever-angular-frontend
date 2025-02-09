import { getLocaleId } from './get-locale-id';

describe('getLocaleId', () => {
  it('should return correct locale for "en" lang', () => {
    expect(getLocaleId('en')).toBe('en-DE');
  });

  it('should return Bokmål locale for Norvegian locale', () => {
    expect(getLocaleId('no')).toBe('nb');
  });

  it('should return locale was passed in any other case', () => {
    expect(getLocaleId('sv')).toBe('sv');
    expect(getLocaleId('es')).toBe('es');
    expect(getLocaleId('de')).toBe('de');
    expect(getLocaleId('da')).toBe('da');
  });
});
