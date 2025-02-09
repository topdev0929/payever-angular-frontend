import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, NgControl } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { ExposedPersonFormComponent } from './exposed-person-form.component';

describe('ExposedPersonFormComponent', () => {

  let component: ExposedPersonFormComponent;
  let fixture: ComponentFixture<ExposedPersonFormComponent>;

  let formGroup: InstanceType<typeof ExposedPersonFormComponent>['formGroup'];

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
      declarations: [ExposedPersonFormComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ExposedPersonFormComponent);
    component = fixture.componentInstance;

    formGroup = component.formGroup;

    fixture.detectChanges();

  });

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should create form with default values', () => {

    const controls = formGroup.controls;

    expect(controls.politicalExposedPerson.value).toBeNull();

  });

  it('should set validators on form control', () => {

    const politicalExposedPerson = formGroup.get('politicalExposedPerson');

    expect(politicalExposedPerson.validator).toBeTruthy();

  });

  it('should validate the form', () => {

    formGroup.controls['politicalExposedPerson'].setValue(null);

    expect(component.validate(formGroup)).toEqual({ invalid: true });

  });

  it('should correctly display the values in select', async () => {

    fixture.debugElement.query(By.css('.mat-select-trigger')).nativeElement.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const matOptions = fixture.debugElement.queryAll(By.css('mat-option'));

    expect(matOptions.length).toEqual(component.booleanOptions.length);

    matOptions.forEach((option, index) => {
      expect(option.nativeElement.textContent.trim()).toEqual(component.booleanOptions[index].label);
    });

  });

  it('should update form control value when an option is selected', async () => {

    fixture.debugElement.query(By.css('.mat-select-trigger')).nativeElement.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const matOptions = fixture.debugElement.queryAll(By.css('mat-option'));

    matOptions.forEach((option, index) => {
      matOptions[index].nativeElement.click();

      expect(formGroup.controls['politicalExposedPerson'].value)
        .toEqual(component.booleanOptions[index].value);
    });

  });

});
