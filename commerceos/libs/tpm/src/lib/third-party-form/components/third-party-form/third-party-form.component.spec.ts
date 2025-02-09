import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FORM_DATE_ADAPTER } from 'src/modules/forms-core/src/form-core/constants';

import { TranslateService } from '@pe/i18n';

import { ThirdPartyFormComponent } from './third-party-form.component';

describe('ThirdPartyFormComponent', () => {

  let fixture: ComponentFixture<ThirdPartyFormComponent>;
  let component: ThirdPartyFormComponent;
  let translateService: jasmine.SpyObj<TranslateService>;

  beforeEach(async(() => {

    const translateServiceSpy = jasmine.createSpyObj<TranslateService>('TranslateService', {
      hasTranslation: false,
      translate: 'translated',
    });

    TestBed.configureTestingModule({
      declarations: [
        ThirdPartyFormComponent,
      ],
      providers: [
        FormBuilder,
        { provide: TranslateService, useValue: translateServiceSpy },
        { provide: FORM_DATE_ADAPTER, useValue: 'form.date.adapter' },
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(ThirdPartyFormComponent);
      component = fixture.componentInstance;

      translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set fieldset', () => {

    const fixSpy = spyOn<any>(component, 'fixFieldsetStyles').and.returnValue({ test: 'fieldset' });
    const fieldset = { test: true };

    component.fieldset = fieldset as any;

    expect(component.formScheme.fieldsets.fieldset).toEqual({ test: 'fieldset' } as any);
    expect(fixSpy).toHaveBeenCalledWith(fieldset as any);

  });

  it('should get fieldset', () => {

    const fieldsetMock = {
      test: 'fieldset',
    } as any;

    /**
     * component.formScheme is set
     * fieldset is set
     */
    component.formScheme = {
      fieldsets: {
        fieldset: fieldsetMock,
      },
    };
    component.formScheme.fieldsets.fieldset = fieldsetMock;

    expect(component.fieldset).toEqual(fieldsetMock);

    /**
     * component.formScheme is null
     */
    component.formScheme = null;

    expect(component.fieldset).toBeNull();

  });

  it('should try instantiate form on init', () => {

    const trySpy = spyOn<any>(component, 'tryInstantiateForm');

    component.ngOnInit();

    expect(trySpy).toHaveBeenCalled();

  });

  it('should create form', () => {

    const toggleControlSpy = spyOn<any>(component, 'toggleControl');
    const toggleControlVisibilitySpy = spyOn<any>(component, 'toggleControlVisibility');
    const fieldSetSpy = spyOnProperty(component, 'fieldset');
    const formSpy = spyOnProperty(component, 'form');
    const form = new FormGroup({
      third: new FormControl('test'),
    });

    /**
     * component.fieldset is null
     */
    fieldSetSpy.and.returnValue(null);

    component.createForm();

    expect(toggleControlSpy).not.toHaveBeenCalled();
    expect(toggleControlVisibilitySpy).not.toHaveBeenCalled();

    /**
     * component.fieldset is set
     * run function then change value for form
     */
    fieldSetSpy.and.returnValue([
      {
        name: 'first',
        fieldSettings: null,
      },
      {
        name: 'second',
        fieldSettings: {
          classList: '',
        },
      },
      {
        name: 'third',
        fieldSettings: {
          classList: 'disabled',
          toggleFieldOnChange: true,
        },
      },
    ]);
    formSpy.and.returnValue(form);

    component.createForm();
    form.controls.third.patchValue('new.test');

    expect(toggleControlSpy).toHaveBeenCalledTimes(1);
    expect(toggleControlSpy).toHaveBeenCalledWith('third', false);
    expect(toggleControlVisibilitySpy).toHaveBeenCalledWith(true, 'new.test');

  });

  it('should handle update form data', () => {

    const submitSpy = spyOn<any>(component, 'submitForm');
    const nextSpy = spyOn(component.change, 'next');
    const formSpy = spyOnProperty(component, 'form');
    const formMock = {
      value: { test: true },
    };

    /**
     * component.lastFormValue is set and is equal to component.form.value
     */
    formSpy.and.returnValue(formMock);

    component.lastFormValue = formMock.value;
    component.onUpdateFormData();

    expect(submitSpy).not.toHaveBeenCalled();
    expect(nextSpy).not.toHaveBeenCalled();

    /**
     * component.lastFormValue is null and not equal to component.form.value
     */
    component.lastFormValue = null;
    component.onUpdateFormData();

    expect(submitSpy).not.toHaveBeenCalled();
    expect(nextSpy).not.toHaveBeenCalled();

    /**
     * component.lastFormValue has been set on prev run of test
     * component.lastFormValue is not equal to component.form.value
     * component.submitOnChange is FALSE
     */
    component.lastFormValue = { test: false };
    component.onUpdateFormData();

    expect(submitSpy).not.toHaveBeenCalled();
    expect(nextSpy).toHaveBeenCalledWith({ test: true });

    /**
     * component.submitOnChange is TRUE
     */
    component.submitOnChange = true;
    component.lastFormValue = { test: false };
    component.onUpdateFormData();

    expect(submitSpy).toHaveBeenCalled();

  });

  it('should handle success', () => {

    const submitSpy = spyOn<any>(component, 'submitForm');

    component.onSuccess();

    expect(submitSpy).toHaveBeenCalled();

  });

  it('should translate', () => {

    /**
     * translateService.hasTranslation returns FALSE
     */
    expect(component.translate('key')).toEqual('key');
    expect(translateService.hasTranslation).toHaveBeenCalledWith('key');
    expect(translateService.translate).not.toHaveBeenCalled();

    /**
     * translateService.hasTranslation returns TRUE
     */
    translateService.hasTranslation.and.returnValue(true);

    expect(component.translate('key')).toEqual('translated');
    expect(translateService.translate).toHaveBeenCalledWith('key');

  });

  it('should submit form', () => {

    const nextSpy = spyOn(component.submit, 'next');
    const formSpy = spyOnProperty(component, 'form').and.returnValue({
      value: { test: true },
    });

    component[`submitForm`]();

    expect(nextSpy).toHaveBeenCalledWith({ test: true });
    expect(formSpy).toHaveBeenCalled();

  });

  it('should try to instantiate form', () => {

    const formSpy = spyOnProperty(component, 'form');
    const setFormSpy = spyOnProperty(component, 'form', 'set');
    const handleSpy = spyOn<any>(component, 'handleNestedElements').and.returnValue({ fieldset: [] });
    const normalizeSpy = spyOn<any>(component, 'normalizeFormScheme').and.returnValue({ test: ['normalized'] });
    const groupSpy = spyOn(component[`formBuilder`], 'group').and.returnValue({ test: 'grouped.form' } as any);

    component.fieldset = [{ test: 'fieldset' }] as any;
    component.fieldsetData = null;

    /**
     * component.form is undefined
     * component.fieldsetData is null
     */
    component[`tryInstantiateForm`]();

    expect(formSpy).toHaveBeenCalled();
    expect(handleSpy).not.toHaveBeenCalled();
    expect(groupSpy).not.toHaveBeenCalled();
    expect(normalizeSpy).not.toHaveBeenCalled();

    /**
     * component.fieldsetData is set
     */
    component.fieldsetData = { test: 'fieldsetData' };
    component[`tryInstantiateForm`]();

    expect(handleSpy).toHaveBeenCalled();
    expect(groupSpy).toHaveBeenCalledWith({ test: ['normalized'] });
    expect(normalizeSpy).toHaveBeenCalledWith([...[{ test: 'fieldset' }]], { ...{ test: 'fieldsetData' } });
    expect(setFormSpy).toHaveBeenCalledWith({ test: 'grouped.form' } as any);

  });

  it('should normalize form scheme', () => {

    const fieldset = [
      {
        name: 'first',
        type: null,
        fieldSettings: { required: true },
      },
      {
        name: 'second',
        type: null,
        fieldSettings: { required: false },
      },
    ];
    const fieldsetData = {
      first: { test: 'first' },
      second: { test: 'second' },
    };

    const result = component[`normalizeFormScheme`](fieldset, fieldsetData);

    expect(result).toEqual({
      first: [
        { test: 'first' },
        [Validators.required],
      ],
      second: [
        { test: 'second' },
        [],
      ],
    });

  });

  it('should fix fieldset styles', () => {

    const fieldSet = [
      {
        name: 'first',
        type: 'input',
        fieldSettings: null,
      },
      {
        name: 'second',
        type: 'checkbox',
        fieldSettings: {
          classList: 'class',
        },
      },
    ];

    /**
     * argument fieldset for fixFieldsetStyles is null
     */
    expect(component[`fixFieldsetStyles`](null)).toEqual([]);

    /**
     * argument fieldset for fixFieldsetStyles is set
     */
    expect(component[`fixFieldsetStyles`](fieldSet as any)).toEqual([
      {
        name: 'first',
        type: 'input',
        fieldSettings: null,
      },
      {
        name: 'second',
        type: 'checkbox',
        fieldSettings: {
          classList: 'class form-fieldset-field-padding-24 connect-checkbox connect-checkbox-nowrap',
        },
      },
    ]);

  });

  it('should handle nested elements', () => {

    const handleSpy = spyOn<any>(component, 'handleNestedAccordion');
    const nestedElements = {
      accordion: [],
      test: {},
    };

    /**
     * component.nestedElements is null
     */
    component.nestedElements = null;
    expect(component[`handleNestedElements`]()).toEqual({
      fieldset: [],
      fieldsetData: {},
    });

    /**
     * component.nestedElements is set
     */
    handleSpy.and.returnValue({
      fieldset: [{ test: 'accordion' }],
      fieldsetData: { test: 'accordion.data' },
    });

    component.nestedElements = nestedElements as any;
    expect(component[`handleNestedElements`]()).toEqual({
      fieldset: [{ test: 'accordion' }],
      fieldsetData: { test: 'accordion.data' },
    } as any);

  });

  it('should handle nested accordion', () => {

    const accordion = [
      {
        fieldset: [{ test: 'fieldset' }],
        fieldsetData: { test: 'fieldset.data' },
      },
      {
        fieldset: [{ test_2: 'fieldset 2' }],
        fieldsetData: { test_2: 'fieldset.data 2' },
      },
    ];

    const result = component[`handleNestedAccordion`](accordion as any);

    expect(result).toEqual({
      fieldset: [
        { test: 'fieldset' },
        { test_2: 'fieldset 2' },
      ],
      fieldsetData: {
        test: 'fieldset.data',
        test_2: 'fieldset.data 2',
      },
    } as any);

  });

});
