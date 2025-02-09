import { CUSTOM_ELEMENTS_SCHEMA, importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, NgControl } from '@angular/forms';

import { CompositeForm } from '@pe/checkout/forms';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { PERSON_TYPE, PersonTypeEnum } from '../../../types';
import { SectionsComponentsModule } from '../sections-components.module';

import { GuarantorDetailsFormComponent } from './guarantor-details.component';


describe('GuarantorDetailsFormComponent', () => {

  let component: GuarantorDetailsFormComponent;
  let fixture: ComponentFixture<GuarantorDetailsFormComponent>;

  let formGroup: InstanceType<typeof GuarantorDetailsFormComponent>['formGroup'];
  const PersonType = PersonTypeEnum.Customer;

  beforeEach(() => {

    const fb = new FormBuilder();
    const formControl = fb.control(null, []);

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        importProvidersFrom(SectionsComponentsModule),
        { provide: NgControl, useValue: formControl },
        { provide: PERSON_TYPE, useValue: PersonType },
      ],
      declarations: [
        GuarantorDetailsFormComponent,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(GuarantorDetailsFormComponent);
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

    expect(formGroup.get('email')).toBeTruthy();
    expect(formGroup.get('email').value).toBeNull();
    expect(formGroup.get('email').validator).toBeTruthy();
    expect(formGroup.get('salutation')).toBeTruthy();
    expect(formGroup.get('salutation').value).toBeNull();
    expect(formGroup.get('salutation').validator).toBeTruthy();
    expect(formGroup.get('firstName')).toBeTruthy();
    expect(formGroup.get('firstName').value).toBeNull();
    expect(formGroup.get('firstName').validator).toBeTruthy();
    expect(formGroup.get('lastName')).toBeTruthy();
    expect(formGroup.get('lastName').value).toBeNull();
    expect(formGroup.get('lastName').validator).toBeTruthy();

  });

  it('should salutationOptions return correct options', () => {

    const expectedSalutationOptions = [
      {
        label: $localize`:@@checkout_address_edit.form.salutation.value.SALUTATION_MR:`,
        value: 'SALUTATION_MR',
      },
      {
        label: $localize`:@@checkout_address_edit.form.salutation.value.SALUTATION_MRS:`,
        value: 'SALUTATION_MRS',
      },
    ];

    expect(component.salutationOptions).toEqual(expectedSalutationOptions);

  });

});
