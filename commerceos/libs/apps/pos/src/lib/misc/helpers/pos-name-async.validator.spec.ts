import { Observable, of } from 'rxjs';

import { PosApi } from '../../services';

import { terminalNameAsyncValidator } from './pos-name-async.validator';

describe('terminalNameAsyncValidator', () => {

  const apiSpy = jasmine.createSpyObj<PosApi>('PosApi', ['validateName']);

  const validatorFn = terminalNameAsyncValidator(apiSpy);

  it('should validate', () => {

    const controlMock = {
      dirty: false,
      value: 'new shop',
    };

    // control.dirty = FALSE
    expect(validatorFn(controlMock as any)).toBeNull();
    expect(apiSpy.validateName).not.toHaveBeenCalled();

    // control.dirty = TRUE
    // INVALID
    controlMock.dirty = true;
    apiSpy.validateName.and.returnValue(of(false));

    (validatorFn(controlMock as any) as Observable<any>)
      .subscribe(errors => expect(errors).toEqual({ unique: true })).unsubscribe();
    expect(apiSpy.validateName).toHaveBeenCalledWith(controlMock.value);

    // VALID
    apiSpy.validateName.and.returnValue(of(true));

    (validatorFn(controlMock as any) as Observable<any>)
      .subscribe(errors => expect(errors).toBeNull()).unsubscribe();

  });

});
