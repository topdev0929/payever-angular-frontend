import { ErrorBag, ErrorBagDeepData } from './error-bag';

describe('ErrorBag', () => {
  let service: ErrorBag;

  beforeEach(() => {
    service = new ErrorBag();
  });

  it('should set\'n\'get error', () => {
    const errorKey: string = 'some-field';
    const deepErrorKeys: string[] = ['deep', 'error'];
    const errorValue: string = 'Some Urgent Error';
    const deepErrorValue: string = '[Deep] Some Urgent Error';
    const errors: ErrorBagDeepData = {
      [errorKey]: errorValue,
      [deepErrorKeys[0]]: {
        [deepErrorKeys[1]]: deepErrorValue,
      }
    };
    service.setErrors(errors);
    expect(service.getError(errorKey)).toBe(errorValue);
    expect(service.getError(`${errorKey}-not-exists`)).toBeFalsy();
    expect(service.getError(deepErrorKeys[0])).toBeFalsy();
    expect(service.getError(deepErrorKeys[1])).toBeFalsy();
    expect(service.getError(deepErrorKeys.join('.'))).toBe(deepErrorValue);
  });

  it('should not accept errors object mutation', () => {
    const existsErrorKey: string = 'some-error-key';
    const anotherErrorKey: string = 'another-error-key';
    const deepErrorKeys: string[] = ['deep', 'error'];
    const errorValue: string = 'Some Urgent Error';

    const errors: ErrorBagDeepData = {
      [existsErrorKey]: errorValue,
      [deepErrorKeys[0]]: {
        [deepErrorKeys[1]]: errorValue,
      }
    };
    service.setErrors(errors);
    expect(Object.keys(errors).includes(anotherErrorKey)).toBeFalsy('self-test');

    errors[anotherErrorKey] = 'another-new error';
    expect(Object.keys(errors).includes(anotherErrorKey)).toBeTruthy('self-test');
    expect(service.getError(anotherErrorKey)).toBeFalsy();
    expect(service.getError(existsErrorKey)).toBeTruthy();

    errors[deepErrorKeys[0]][deepErrorKeys[1]] = 'An Updated Urgent Error';
    expect(service.getError(deepErrorKeys.join('.'))).toBe(errorValue);
  });

  it('should get errors from $errors() pipe', () => {
    let passedErrors: ErrorBagDeepData;
    service.errors$.subscribe(
      value => passedErrors = value,
      fail
    );
    expect(passedErrors).toEqual({}, 'empty initially');

    const errors: ErrorBagDeepData = {
      'some-error-key': 'Some Very Dummy Error',
      'some-deep-descr': {
        'level-2-key-will-be-flattened': 'Non so important issue, but, please, change your name from "мистер Ху%" to real!'
      }
    };
    service.setErrors(errors);
    expect(passedErrors).toEqual(errors);
    expect(passedErrors).not.toBe(errors, 'should be deep copy');
  });

  it('should get errors from $errorsFlat() pipe', () => {
    let passedFlatErrors: ErrorBagDeepData;
    service.errorsFlat$.subscribe(
      value => passedFlatErrors = value,
      fail
    );
    expect(passedFlatErrors).toEqual({}, 'empty initially');

    const errors: ErrorBagDeepData = {
      'some-error-key': 'Some Very Dummy Error',
      'some-deep-descr': {
        'level-2-key-will-be-flattened': 'Non so important issue, but, please, change your name from "мистер Ху%" to real!'
      }
    };
    service.setErrors(errors);
    expect(passedFlatErrors).toEqual({
      'some-error-key': errors['some-error-key'],
      'some-deep-descr.level-2-key-will-be-flattened': errors['some-deep-descr']['level-2-key-will-be-flattened']
    });
  });

  it('should get errors via getError$()', () => {
    const errorKey: string = 'some-field';
    const deepErrorKeys: string[] = ['very-deep', 'error'];
    const errorValue: string = 'Some Urgent Error';
    let errors: ErrorBagDeepData;

    errors = {
      [errorKey]: errorValue,
      [deepErrorKeys[0]]: {
        [deepErrorKeys[1]]: errorValue,
      }
    };

    let passedPlainError: string;
    service.getError$(errorKey).subscribe(
      value => passedPlainError = value,
      fail
    );
    expect(passedPlainError).toBeUndefined();

    let passedDeepError: string;
    service.getError$(deepErrorKeys.join('.')).subscribe(
      value => passedDeepError = value
    );
    expect(passedDeepError).toBeUndefined();

    service.setErrors(errors);
    expect(passedPlainError).toBe(errorValue);
    expect(passedDeepError).toBe(errorValue);

    const newErrorValue: string = 'An Updated Urgent Error';
    expect(newErrorValue).not.toBe(errorValue, 'self-test');
    errors = {
      [errorKey]: newErrorValue,
      [deepErrorKeys[0]]: {
        [deepErrorKeys[1]]: newErrorValue,
      }
    };
    service.setErrors(errors);
    expect(passedPlainError).toBe(newErrorValue);
    expect(passedDeepError).toBe(newErrorValue);
  });

  it('should accept some invalid values as errors and not crash', () => {
    try {
      service.setErrors([] as any);
      service.setErrors({});
      expect(true).toBeTruthy('should win :)');
    } catch (e) {
      expect(e).toBeFalsy();
    }
  });

  it('should convert error keys to snakeCase', () => {
    let errors: ErrorBagDeepData;

    const flatKey: string = 'flat-key';
    const flatValue: string = 'flat-value';
    const deepKeys: string[] = ['deep-key-1', 'deep-key-2'];
    const deepValue: string = 'deep-value';
    errors = {
      [flatKey]: flatValue,
      [deepKeys[0]]: {
        [deepKeys[1]]: deepValue
      }
    };
    service.setSnakeKeysMode(true);
    service.setErrors(errors);
    expect(service.getError('flat_key')).toBe(flatValue);
    expect(service.getError('deep_key_1.deep_key_2')).toBe(deepValue);

    service.setSnakeKeysMode(false);
    expect(service.getError('flat_key')).toBe(flatValue);
    expect(service.getError('deep_key_1.deep_key_2')).toBe(deepValue);

    service.setSnakeKeysMode(false);
    service.setErrors(errors);
    expect(service.getError(flatKey)).toBe(flatValue);
    expect(service.getError(deepKeys.join('.'))).toBe(deepValue);

    service.setSnakeKeysMode(true);
    expect(service.getError(flatKey)).toBe(flatValue);
    expect(service.getError(deepKeys.join('.'))).toBe(deepValue);
  });
});
