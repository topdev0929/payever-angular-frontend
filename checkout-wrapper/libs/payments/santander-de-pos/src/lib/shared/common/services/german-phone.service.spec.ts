import { TestBed } from '@angular/core/testing';
import { AbstractControl } from '@angular/forms';
import { Store } from '@ngxs/store';

import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { flowWithPaymentOptionsFixture } from '../../../test';

import { GermanPhoneService } from './german-phone.service';

describe('GermanPhoneService', () => {
  let service: GermanPhoneService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        GermanPhoneService,
      ],
    });

    const store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

    service = TestBed.inject(GermanPhoneService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });


  describe('transform', () => {
    it('should transform international format phone number with leading "00" to "+", removing separators', () => {
      const phoneNumber = '00491234567890';

      const result = service.transform(phoneNumber);

      expect(result).toBe('+491234567890');
    });

    it('should remove separators from the phone number', () => {
      const phoneNumber = '+49 123-4567 890';

      const result = service.transform(phoneNumber);

      expect(result).toBe('+491234567890');
    });

    it('should handle empty input and return an empty string', () => {
      const phoneNumber = '';

      const result = service.transform(phoneNumber);

      expect(result).toBe('');
    });
  });

  describe('validators', () => {
    it('should return a validator function that detects invalid phone numbers', () => {
      const invalidPhoneNumber = '123'; // Invalid length

      const [validator] = service.validators();
      const result = validator({ value: invalidPhoneNumber } as AbstractControl);

      expect(result).toEqual({
        phone: {
          valid: false,
        },
      });
    });

    it('should return a validator function that allows valid phone numbers', () => {
      const validPhoneNumber = '+491234567890';

      const [validator] = service.validators();
      const result = validator({ value: validPhoneNumber } as AbstractControl);

      expect(result).toBeNull();
    });

    it('should return a validator function that allows empty input', () => {
      const emptyInput = '';

      const [validator] = service.validators();
      const result = validator({ value: emptyInput } as AbstractControl);

      expect(result).toBeNull();
    });
  });
});
