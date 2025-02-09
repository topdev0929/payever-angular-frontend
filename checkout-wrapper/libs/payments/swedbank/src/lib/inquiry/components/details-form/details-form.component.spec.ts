import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroupDirective, NgControl } from '@angular/forms';
import { Store } from '@ngxs/store';

import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { flowWithPaymentOptionsFixture } from '../../../test';

import { DetailsFormComponent } from './details-form.component';

describe('DetailsFormComponent', () => {

  let component: DetailsFormComponent;
  let fixture: ComponentFixture<DetailsFormComponent>;

  let store: Store;

  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [DetailsFormComponent],
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        { provide: NgControl, useValue: new FormControl() },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

    fixture = TestBed.createComponent(DetailsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

  });

  afterEach(() => {

    jest.clearAllMocks();

  });

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should create the form with initial form state', () => {

    expect(component.formGroup.get('phone')).toBeTruthy();
    expect(component.formGroup.get('phone').value).toBeNull();
    expect(component.formGroup.get('phone').validator).toBeTruthy();

  });

  it('should handle submitted when form valid', (done) => {

    component['formGroupDirective'] = {
      onSubmit: jest.fn(),
    } as unknown as FormGroupDirective;

    component.formGroup.setValue({
      phone: '+46771793336',
    } as any);

    component.submitted.subscribe((value) => {
      expect(component.formGroup.valid).toBeTruthy();
      expect(value).toEqual({ phone: '+46771793336' });

      done();
    });

    component['submit$'].next();

  });

});
