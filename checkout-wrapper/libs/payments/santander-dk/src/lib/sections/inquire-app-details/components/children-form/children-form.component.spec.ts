import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, NgControl } from '@angular/forms';

import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { ChildrenFormComponent } from './children-form.component';

describe('ChildrenFormComponent', () => {

  let component: ChildrenFormComponent;
  let fixture: ComponentFixture<ChildrenFormComponent>;

  let formGroup: InstanceType<typeof ChildrenFormComponent>['formGroup'];

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
      declarations: [ChildrenFormComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ChildrenFormComponent);
    component = fixture.componentInstance;

    formGroup = component.formGroup;

    fixture.detectChanges();

  });

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should init with empty form array for children', () => {

    expect(formGroup.controls.children.length).toEqual(0);

  });

  it('should initialize form with correct validators', () => {

    const countControl = formGroup.get('_count');
    expect(countControl.validator).toBeDefined();
    const errors = countControl.errors || {};
    expect(errors['required']).toBeTruthy();

  });

  it('should create a new child form on createForm call', () => {

    const initialLength = component.childrenArray.length;

    (component as any).createForm();
    fixture.detectChanges();

    expect(component.childrenArray.length).toBe(initialLength + 1);

  });

  it('should correct times call createForm if _count changes', () => {

    const createForm = jest.spyOn((component as any), 'createForm');

    formGroup.get('_count').setValue(10 as any);
    fixture.detectChanges();
    expect(createForm).toHaveBeenCalledTimes(10);

  });

  it('should validate child age', () => {

    (component as any).createForm();
    fixture.detectChanges();

    const childForm = component.childrenArray.at(0);
    const ageControl = childForm.get('age');

    ageControl.setValue(-1);
    expect(ageControl.valid).toBeFalsy();
    ageControl.setValue(101);
    expect(ageControl.valid).toBeFalsy();
    ageControl.setValue(50);
    expect(ageControl.valid).toBeTruthy();

  });

  it('should correctly unmask count value', () => {

    expect(component.countUnmask('5')).toEqual(5);
    expect(component.countUnmask('')).toEqual('');

  });

  it('should correctly unmask age value', () => {

    expect(component.ageUnmask('10')).toEqual(10);
    expect(component.ageUnmask('')).toEqual('');

  });

  it('should correctly mask count value', () => {

    const MAX_CHILDREN_COUNT = 20;

    expect(component.countMask('100')).toEqual(MAX_CHILDREN_COUNT.toString());
    expect(component.countMask('-1')).toEqual('1');

  });

  it('should correctly mask age value', () => {

    const MAX_AGE = 100;

    expect(component.ageMask('100')).toEqual(MAX_AGE.toString());
    expect(component.ageMask('-1')).toEqual('1');

  });

  it('should trackByIdx return index', () => {

    expect(component.trackByIdx(1)).toEqual(1);

  });

});
