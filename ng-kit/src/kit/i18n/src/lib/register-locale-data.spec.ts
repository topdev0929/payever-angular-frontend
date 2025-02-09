import { registerLocaleData } from './register-locale-data';
import * as utils from '@angular/common';

describe('registerLocaleData', () => {
  it('should register locale data', () => {
    const result: string = 'result';
    const registerLocaleDataSpy: jasmine.Spy = jasmine.createSpy().and.returnValue(result);
    spyOnProperty(utils, 'registerLocaleData').and.returnValue(registerLocaleDataSpy);

    registerLocaleData(result);
    expect(registerLocaleDataSpy).toHaveBeenCalled();
  });
});
