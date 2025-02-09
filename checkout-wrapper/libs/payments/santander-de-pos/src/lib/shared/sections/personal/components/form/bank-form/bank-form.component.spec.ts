import { CUSTOM_ELEMENTS_SCHEMA, importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, NgControl } from '@angular/forms';

import { CompositeForm } from '@pe/checkout/forms';
import {
  PERSON_TYPE,
  PersonTypeEnum,
} from '@pe/checkout/santander-de-pos/shared';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { PersonalModule } from '../../../personal.module';

import { BankFormComponent } from './bank-form.component';

describe('BankFormComponent', () => {

  let component: BankFormComponent;
  let fixture: ComponentFixture<BankFormComponent>;

  let formGroup: InstanceType<typeof BankFormComponent>['formGroup'];
  const PersonType = PersonTypeEnum.Customer;
  const deIban = 'DE75512108001245126199';

  beforeEach(() => {

    const fb = new FormBuilder();
    const formControl = fb.control(null, []);

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        importProvidersFrom(PersonalModule),
        { provide: NgControl, useValue: formControl },
        { provide: PERSON_TYPE, useValue: PersonType },
      ],
      declarations: [
        BankFormComponent,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(BankFormComponent);
    component = fixture.componentInstance;

    formGroup = component.formGroup;

  });

  afterEach(() => {

    fixture?.destroy();
    jest.clearAllMocks();

  });

  it('should create an instance', () => {

    expect(component).toBeTruthy();
    expect(component instanceof CompositeForm).toBe(true);

  });

  it('should defined formGroup', () => {

    expect(formGroup.get('bankIBAN')).toBeTruthy();
    expect(formGroup.get('bankIBAN').value).toBeNull();
    expect(formGroup.get('bankIBAN').validator).toBeTruthy();
    expect(formGroup.get('bankBIC')).toBeTruthy();
    expect(formGroup.get('bankBIC').value).toBeNull();
    expect(formGroup.get('bankBIC').validator).toBeTruthy();

  });

  it('should enforce iban validators to the bankIBAN', () => {

    const bankIBAN = formGroup.get('bankIBAN');

    bankIBAN.setValue(null);
    expect(bankIBAN.valid).toBeFalsy();

    bankIBAN.setValue('DE1111');
    expect(bankIBAN.valid).toBeFalsy();

    bankIBAN.setValue(deIban);
    expect(bankIBAN.valid).toBeTruthy();

  });

  it('should enforce required validators to the bankBIC', () => {

    const bankBIC = formGroup.get('bankBIC');

    bankBIC.setValue(null);
    expect(bankBIC.valid).toBeFalsy();

    bankBIC.setValue('');
    expect(bankBIC.valid).toBeFalsy();

    bankBIC.setValue('bank-bic');
    expect(bankBIC.valid).toBeTruthy();

  });

  it('should disabled BankBIC if IBAN is start with DE', () => {

    const bankIBAN = formGroup.get('bankIBAN');
    const bankBIC = formGroup.get('bankBIC');

    component.ngOnInit();

    bankIBAN.setValue(deIban);

    expect(bankBIC.disabled).toBeTruthy();

  });

  it('should enabled BankBIC if IBAN is not start with DE', () => {

    const bankIBAN = formGroup.get('bankIBAN');
    const bankBIC = formGroup.get('bankBIC');

    component.ngOnInit();

    bankIBAN.setValue('EN');
    expect(bankBIC.enabled).toBeTruthy();

    bankIBAN.setValue('GE60NB0000000123456789');
    expect(bankBIC.enabled).toBeTruthy();

  });

});
