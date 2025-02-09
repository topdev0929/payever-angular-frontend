import { getLang } from './get-lang';
import * as utils from './get-locales';
import { DEFAULT_LANG } from '../constants';

describe('getLang', () => {
  it('should return locale', () => {
    const config: any = {
      useStorageForLocale: false
    };

    expect(getLang(config)).toBe(DEFAULT_LANG);
  });

  it('should return locale and call functions', () => {
    const config: any = {
      useStorageForLocale: true
    };
    const getLangListSpy: jasmine.Spy = jasmine.createSpy('getLangListSpy').and.returnValue({});
    spyOnProperty(utils, 'getLangList').and.returnValue(getLangListSpy);
    const setSpy: jasmine.Spy = spyOn(localStorage, 'setItem').and.stub();
    const getSpy: jasmine.Spy = spyOn(localStorage, 'getItem').and.stub();

    expect(getLang(config)).toBe(DEFAULT_LANG);
    expect(setSpy).toHaveBeenCalledWith('pe_current_locale', DEFAULT_LANG);
    expect(getSpy).toHaveBeenCalledWith('pe_current_locale');
  });
});
