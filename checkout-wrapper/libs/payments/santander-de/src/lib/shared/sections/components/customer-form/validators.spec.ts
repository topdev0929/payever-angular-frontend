import { AbstractControl, FormControl, FormGroup } from '@angular/forms';

import { zipCode } from './validators';

describe('zipCode', () => {
  let formGroup: FormGroup;
  let prevAddressZip: AbstractControl;
  let prevAddressCountry: AbstractControl;

  beforeEach(() => {
    formGroup = new FormGroup({
      prevAddressZip: new FormControl(''),
      prevAddressCountry: new FormControl(''),
    });
    prevAddressZip = formGroup.get('prevAddressZip');
    prevAddressCountry = formGroup.get('prevAddressCountry');
  });

  it('should validate a correct German zip code as valid', () => {
    prevAddressCountry.setValue('DE');
    prevAddressZip.setValue('12345');
    expect(zipCode(prevAddressZip)).toEqual(null);
  });

  it('should validate an incorrect German zip code (wrong length) as invalid', () => {
    prevAddressCountry.setValue('DE');
    prevAddressZip.setValue('12');
    expect(zipCode(prevAddressZip)).toEqual({ zipCodeInvalid: true } );

    prevAddressZip.setValue('123467');
    expect(zipCode(prevAddressZip)).toEqual({ zipCodeInvalid: true } );

    prevAddressZip.setValue('1ffff');
    expect(zipCode(prevAddressZip)).toEqual({ zipCodeInvalid: true } );
  });

  it('should validate an incorrect German zip code (non-numeric characters) as invalid', () => {
    prevAddressCountry.setValue('DE');
    prevAddressZip.setValue('12345-invalid');
    expect(zipCode(prevAddressZip)).toEqual({ zipCodeInvalid: true } );
  });

  it('should validate a non-German zip code as valid', () => {
    prevAddressCountry.setValue('AT');
    prevAddressZip.setValue('TEST1');
    expect(zipCode(prevAddressZip)).toEqual(null);

    prevAddressCountry.setValue('UK');
    prevAddressZip.setValue('12323');
    expect(zipCode(prevAddressZip)).toEqual(null);
  });

  it('should validate a non-German zip code as invalid', () => {
    prevAddressCountry.setValue('AT');
    prevAddressZip.setValue('111111');
    expect(zipCode(prevAddressZip)).toEqual({ zipCodeInvalid: true } );

    prevAddressCountry.setValue('UK');
    prevAddressZip.setValue('123');
    expect(zipCode(prevAddressZip)).toEqual({ zipCodeInvalid: true } );
  });
});
