import { getLocaleIdAndRegisterLocaleData } from './get-locale-id-and-register-locale-data';
import * as getLocaleId from './get-locale-id';
import * as registerLocaleData from './register-locale-data';

describe('getLocaleIdAndRegisterLocaleData', () => {
  it('should get locale id and register locale data', () => {
    const result: string = 'result';
    const lang: string = 'lang';
    const getLocaleIdSpy: jasmine.Spy = jasmine.createSpy('getLocaleIdSpy').and.returnValue(result);
    spyOnProperty(getLocaleId, 'getLocaleId').and.returnValue(getLocaleIdSpy);
    const registerLocaleDataSpy: jasmine.Spy = jasmine.createSpy('registerLocaleDataSpy');
    spyOnProperty(registerLocaleData, 'registerLocaleData').and.returnValue(registerLocaleDataSpy);

    expect(getLocaleIdAndRegisterLocaleData(lang)).toBe(result);
    expect(registerLocaleDataSpy).toHaveBeenCalledWith(lang);
    expect(getLocaleIdSpy).toHaveBeenCalledWith(lang);
  });
});
