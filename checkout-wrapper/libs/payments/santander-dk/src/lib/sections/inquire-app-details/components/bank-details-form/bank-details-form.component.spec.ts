import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  FormBuilder,
  NgControl,
} from '@angular/forms';

import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { BankDetailsFormComponent } from './bank-details-form.component';

describe('BankDetailsFormComponent', () => {

  let component: BankDetailsFormComponent;
  let fixture: ComponentFixture<BankDetailsFormComponent>;

  beforeEach(() => {

    const fb = new FormBuilder();
    const formControl = fb.control(null, []);

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        { provide: NgControl, useValue: formControl },
      ],
      declarations: [BankDetailsFormComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();


    fixture = TestBed.createComponent(BankDetailsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

  });

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should registrationNumberMask work correctly', () => {

    const maskedValue = component.registrationNumberMask('12345678');
    expect(maskedValue).toEqual('1234');

  });

  it('should registrationNumberMask only digital', () => {

    const maskedValue = component.registrationNumberMask('abc123');
    expect(maskedValue).toEqual('123');

  });

  it('should accountNumberMask work correctly', () => {

    const maskedValue = component.accountNumberMask('123456789');
    expect(maskedValue).toEqual('123 456789');

  });

  it('should accountNumberUnmask work correctly', () => {

    const maskedValue = component.accountNumberUnmask('123 456789');
    expect(maskedValue).toEqual('123456789');

  });

  it('should accountNumberMask handle empty values', () => {

    const maskedValue = component.accountNumberMask('');
    expect(maskedValue).toEqual('');

  });

});
