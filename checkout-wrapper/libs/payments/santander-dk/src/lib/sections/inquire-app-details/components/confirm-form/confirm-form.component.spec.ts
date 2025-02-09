import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  FormBuilder,
  NgControl,
} from '@angular/forms';

import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { ConfirmFormComponent } from './confirm-form.component';

describe('ConfirmFormComponent', () => {

  let component: ConfirmFormComponent;
  let fixture: ComponentFixture<ConfirmFormComponent>;

  let formGroup: InstanceType<typeof ConfirmFormComponent>['formGroup'];

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
      declarations: [ConfirmFormComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmFormComponent);
    component = fixture.componentInstance;

    formGroup = component.formGroup;

    fixture.detectChanges();

  });

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should be invalid when form empty', () => {

    expect(formGroup.valid).toBeFalsy();

  });

  it('should applyOnBehalfOfOther field validity', () => {

    expect(formGroup.controls['applyOnBehalfOfOther'].valid).toBeTruthy();

  });

  it('should confirmEnteredData field validity', () => {

    expect(formGroup.controls['confirmEnteredData'].valid).toBeFalsy();

  });

  it('should _agreeObtainCreditStatus field validity', () => {

    expect(formGroup.controls['_agreeObtainCreditStatus'].valid).toBeFalsy();

  });

  it('should be valid when form value is filled out', () => {

    formGroup.controls['applyOnBehalfOfOther'].setValue(true);
    formGroup.controls['confirmEnteredData'].setValue(true);
    formGroup.controls['_agreeObtainCreditStatus'].setValue(true);

    expect(formGroup.valid).toBeTruthy();

  });

});
