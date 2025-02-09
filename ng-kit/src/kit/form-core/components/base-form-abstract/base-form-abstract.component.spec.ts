// tslint:disable max-classes-per-file
// tslint:disable max-file-line-count

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Component, Injector, NgModule, ViewChild, Input, ElementRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { SessionStorageService, NgxWebstorageModule } from 'ngx-webstorage';
import { Subject, Observable } from 'rxjs';

/*
import { FormAbstractComponent } from '../form-abstract';
import { FormScheme, FormSchemeFieldsets, FormSchemeField } from '../../interfaces';
import { ErrorBag, ErrorBagDeepData, ErrorBagFlatData } from '../../services';
import { LANG, TranslateStubService, DEFAULT_LANG } from '../../../i18n';
import { nonRecompilableTestModuleHelper } from '../../../test';
import { FieldsetErrorStateMatcher } from '../../classes';
import { FORM_DATE_ADAPTER, FormValues, FormControlsType } from './form-abstract.component';
import { GenericDateAdapter } from '../../date-adapters';
import { TransformDateService } from '../../services';

interface FormDataInterface {
  '[test-field-name]': string;
}

@Component({
  selector: 'test-input',
  template: `
    <input
      type="text"
      [formControl]="formControl"
    />
  `
})
class TestInput {
  @Input('formControlRef') formControl: FormControl;
}

@Component({
  template: `
    <form #formRef novalidate (ngSubmit)="onSubmit()" [formGroup]="form" *ngIf="form">
      <test-input
        #input
        [formControlRef]="form.get(fieldName)"
      ></test-input>
      <div *ngFor="let fieldset of fieldsets" class="test-fieldset-row"></div>
    </form>`,
})
class TestForm extends FormAbstractComponent<FormDataInterface> {
  fieldName: string = '[test-field-name]';
  fieldsetName: string = '[test-fieldset-name]';

  isSubmitted: boolean = false;

  formScheme: FormScheme = {
    fieldsets: {
      [this.fieldsetName]: [
        {
          name: this.fieldName,
          type: 'input',
        },
      ]
    }
  };
  errorStateMatcher: FieldsetErrorStateMatcher = new FieldsetErrorStateMatcher();

  @ViewChild('input', { static: true }) input: TestInput;
  @ViewChild('formRef', { static: true }) formRef: ElementRef<HTMLFormElement>;

  public formBuilder: FormBuilder = this.injector.get(FormBuilder);
  public errorBag: ErrorBag = this.injector.get(ErrorBag);
  public el: ElementRef<HTMLElement> = this.injector.get(ElementRef);
  public formStorageKey: string = 'test_fieldset.form';

  get fieldsets(): FormSchemeField[][] {
    return this.formScheme.fieldsets && Object.keys(this.formScheme.fieldsets)
      .map(key => this.formScheme.fieldsets[key]) || [];
  }

  constructor(
    injector: Injector,
  ) {
    super(injector);
  }

  onUpdateFormData(): void {
    // stub method
  }

  onSuccess(): void {
    // stub method
  }

  forceRerenderAllFieldsets(): void {
    super.forceRerenderAllFieldsets();
  }

  saveDataToStorage(): void {
    super.saveDataToStorage();
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      [this.fieldName]: null
    });
    this.changeDetectorRef.detectChanges();
  }

  scrollToError(container: HTMLElement): void {
    super.scrollToError(container);
  }

  testScrollToErrorRef(): HTMLElement {
    const errorRef: HTMLElement = document.createElement(this.errorElementName);
    (this.formRef.nativeElement as HTMLFormElement).appendChild(errorRef);
    return errorRef;
  }

  testSubmitTriggerRef(): HTMLButtonElement {
    const button: HTMLButtonElement = document.createElement('button');
    this.submitTriggerRef = new ElementRef(button);
    (this.formRef.nativeElement as HTMLFormElement).appendChild(button);
    return button;
  }
}

@NgModule({
  declarations: [
    TestInput,
    TestForm,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NoopAnimationsModule,
    NgxWebstorageModule.forRoot({
      prefix: 'pe.test',
      separator: '.',
      caseSensitive: true
    }),
  ],
  providers: [
    ErrorBag,
    TranslateStubService.provide(),
    TransformDateService,
    { provide: LANG, useValue: DEFAULT_LANG, },
    {
      provide: FORM_DATE_ADAPTER,
      useClass: GenericDateAdapter,
      deps: [TransformDateService]
    },
  ]
})
class TestModule {}

describe('FormAbstractComponent', () => {
  let component: TestForm;
  let fixture: ComponentFixture<TestForm>;

  const testFieldsetRowSelector: string = '.test-fieldset-row';

  nonRecompilableTestModuleHelper({
    imports: [TestModule]
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestForm);
    component = fixture.componentInstance;
  });

  describe('without auto-initialization', () => {
    it('should call createForm() on initialization', () => {
      spyOn(component, 'createForm');
      fixture.detectChanges();
      expect(component.createForm).toHaveBeenCalled();
    });

    it('should call forceRerenderAllFieldsets() on initialization', () => {
      spyOn(component, 'forceRerenderAllFieldsets');
      component.createForm();
      expect(component.forceRerenderAllFieldsets).toHaveBeenCalled();
    });

    it('should allow to set form on initialization', () => {
      spyOn(component, 'onUpdateFormData');
      const form: FormGroup = component.formBuilder.group({
        [component.fieldName]: null,
      });
      component.form = form;
      expect(component.onUpdateFormData).toHaveBeenCalledTimes(1);
      expect(component.form).toBe(form, 'getter should return last form');
    });

    it('should not allow to set another form after first has been setted', () => {
      expect(() => {
        const form: FormGroup = component.formBuilder.group({
          [component.fieldName]: null,
        });
        component.form = form;
        component.form = form; // yes, twice! and, yes, no detectChanges() here :)
      }).not.toThrowError();

      expect(() => {
        component.form = component.formBuilder.group({
          [component.fieldName]: null,
        });
      }).toThrowError();
    });

    it('onSubmit() should produce an error if called without form', () => {
      expect(component.form).toBeNull();
      expect(() => {
        component.onSubmit();
      }).toThrowError();
      expect(component.isSubmitted).toBe(false);
    });

    it('should submit form with onSubmit() if no errors found', () => {
      expect(component.isSubmitted).toBe(false, 'self-test');

      component.form = component.formBuilder.group({
        [component.fieldName]: 'some-valid-value'
      });
      expect(component.form.touched).toBe(false, 'self-test');
      expect(component.form.valid).toBe(true);

      spyOn(component, 'saveDataToStorage');
      spyOn(component, 'onSuccess');
      spyOn(component, 'scrollToError');
      component.onSubmit();
      expect(component.isSubmitted).toBe(true);
      expect(component.form.touched).toBe(true);
      expect(component.saveDataToStorage).toHaveBeenCalledTimes(1);
      expect(component.onSuccess).toHaveBeenCalledTimes(1);
      expect(component.scrollToError).not.toHaveBeenCalled();
    });

    it('should not submit form with onSubmit() if form invalid', () => {
      expect(component.isSubmitted).toBe(false, 'self-test');

      component.form = component.formBuilder.group({
        [component.fieldName]: [null, Validators.required]
      });
      expect(component.form.touched).toBe(false, 'self-test');
      expect(component.form.valid).toBe(false);

      spyOn(component, 'saveDataToStorage');
      spyOn(component, 'onSuccess');
      spyOn(component, 'scrollToError');
      component.onSubmit();
      expect(component.isSubmitted).toBe(true);
      expect(component.form.touched).toBe(true);
      expect(component.saveDataToStorage).not.toHaveBeenCalled();
      expect(component.onSuccess).not.toHaveBeenCalled();
      expect(component.scrollToError).toHaveBeenCalledWith(component.el.nativeElement);
    });

    it('should rerender fieldsets with forceRerenderAllFieldsets() and forceRerenderFieldset(name)', () => {
      const fieldsets: FormSchemeFieldsets = component.formScheme.fieldsets;
      const [firstFieldsetName]: string[] = Object.keys(fieldsets);
      delete component.formScheme.fieldsets;

      expect(() => {
        component.forceRerenderAllFieldsets();
        fixture.detectChanges();
      }).not.toThrowError();

      const emptyFieldsets: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll(testFieldsetRowSelector)
      );
      expect(emptyFieldsets.length).toBe(0);

      component.formScheme.fieldsets = fieldsets;
      component.forceRerenderAllFieldsets();
      fixture.detectChanges();
      const rerenderedFieldsets: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll(testFieldsetRowSelector)
      );
      expect(rerenderedFieldsets.length).toBe(Object.keys(component.formScheme.fieldsets).length);
      expect(
        rerenderedFieldsets
          .map((el, i) => el === emptyFieldsets[i])
          .some(Boolean)
      ).toBe(false);

      component.forceRerenderAllFieldsets();
      fixture.detectChanges();
      const rerenderedFieldsets2: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll(testFieldsetRowSelector)
      );
      expect(rerenderedFieldsets2.length).toBe(Object.keys(component.formScheme.fieldsets).length);
      expect(
        rerenderedFieldsets2
          .map((el, i) => el === emptyFieldsets[i])
          .some(Boolean)
      ).toBe(false);

      component['forceRerenderFieldset'](firstFieldsetName);
      fixture.detectChanges();
      const [partiallyRerenderedFieldset]: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll(testFieldsetRowSelector)
      );
      expect(partiallyRerenderedFieldset).toBeDefined();
      expect(partiallyRerenderedFieldset).not.toBe(rerenderedFieldsets2[0]);
    });

    it('should not fail with getFormValuesFormatted() if no form presented (yet)', () => {
      expect(() => {
        expect(component.form).toBeFalsy();
        component['getFormValuesFormatted'](false);
      }).not.toThrowError();
    });
  });

  describe('after component initialization', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('Should create component instance', () => {
      expect(component).toBeTruthy();
    });

    it('should call onUpdateFormData() with form updates', () => {
      spyOn(component, 'onUpdateFormData');
      const newValue: string = 'new-value';
      component.form.get(component.fieldName).setValue(newValue);
      expect(component.onUpdateFormData).toHaveBeenCalledWith({ [component.fieldName]: newValue });
    });

    it('should not emit updates with onUpdateFormData() after component destroy', () => {
      spyOn(component, 'onUpdateFormData');
      component.ngOnDestroy();
      const newValue: string = 'new-value';
      component.form.get(component.fieldName).setValue(newValue);
      expect(component.onUpdateFormData).not.toHaveBeenCalled();
    });

    describe('doSubmit$', () => {
      it('@Input() doSubmit$ should call doSubmit() callback while not destoyed', () => {
        spyOn(component, 'doSubmit');
        const doSubmit$: Subject<void> = new Subject();
        component.doSubmit$ = doSubmit$;

        doSubmit$.next();
        expect(component.doSubmit).toHaveBeenCalledTimes(1);

        component.ngOnDestroy();
        doSubmit$.next();
        expect(component.doSubmit).toHaveBeenCalledTimes(1);
      });

      it('should not call doSubmit twice on different doSubmit$ provide', () => {
        spyOn(component, 'doSubmit');

        const doSubmit$1: Subject<void> = new Subject();
        component.doSubmit$ = doSubmit$1;
        doSubmit$1.next();
        expect(component.doSubmit).toHaveBeenCalledTimes(1);

        const doSubmit$2: Subject<void> = new Subject();
        component.doSubmit$ = doSubmit$2;
        doSubmit$2.next();
        expect(component.doSubmit).toHaveBeenCalledTimes(2);
        doSubmit$1.next();
        expect(component.doSubmit).toHaveBeenCalledTimes(2);
      });
    });

    it('should return errors object with errors$ observable', () => {
      const errorBag: ErrorBag = new ErrorBag();
      const errors: ErrorBagDeepData = {
        'some-field-key': 'some error message'
      };
      errorBag.setErrors(errors);
      component.errorBag = errorBag;

      let givenErrors: ErrorBagFlatData; // <-- FLAT data here!
      component.errors$.subscribe(
        e => givenErrors = e
      );
      expect(givenErrors).toEqual(errors as ErrorBagFlatData);
    });

    it('should produce an error on attempt to get errors$ without ErrorBag', () => {
      component.errorBag = null;
      expect(() => {
        const errors: Observable<ErrorBagFlatData> = component.errors$;
        expect(errors).toBeFalsy('should not give any result');
      }).toThrowError();
    });

    it('should produce error on doSumit() call without submitTriggerRef', () => {
      expect(component.submitTriggerRef).toBeFalsy('self-test');
      spyOn(component, 'onSubmit');

      expect(() => {
        component.doSubmit();
      }).toThrowError();

      expect(component.onSubmit).not.toHaveBeenCalled();
    });

    it('should submit form natively via doSubmit()', () => {
      let clicked: boolean = false;
      component.testSubmitTriggerRef().addEventListener('click', () => clicked = true);
      spyOn(component, 'onSubmit');

      component.doSubmit();
      expect(clicked).toBe(true);
      expect(component.onSubmit).toHaveBeenCalledTimes(1);
    });

    it('should get fallback for <=IE11 where `new MouseEvent()` isn\'t working', () => {
      const realMouseEvent: MouseEvent = (window as any).MouseEvent;
      class FakeMouseEvent {
        static errorWasThrown: boolean = false;
        constructor() {
          FakeMouseEvent.errorWasThrown = true;
          throw new Error('MouseEvent is not compatible with IE');
        }
        static revert(): void {
          (window as any).MouseEvent = realMouseEvent;
        }
      }
      (window as any).MouseEvent = FakeMouseEvent;

      let clicked: boolean = false;
      component.testSubmitTriggerRef().addEventListener('click', () => clicked = true);

      spyOn(component, 'onSubmit');
      expect(() => {
        component.doSubmit();
      }).not.toThrowError();
      FakeMouseEvent.revert();
      expect(clicked).toBe(true);
      expect(component.onSubmit).toHaveBeenCalledTimes(1);
      expect(FakeMouseEvent.errorWasThrown).toBe(true, 'self-test');
    });

    it('should get field value via fieldValue$()', () => {
      let receivedValue: string;
      component.fieldValue$(component.fieldName).subscribe(
        val => receivedValue = val,
        fail,
      );
      expect(receivedValue).toBe(null, 'initial value');

      const value1: string = '[test-value-1]';
      component.form.get(component.fieldName).setValue(value1);
      expect(receivedValue).toBe(value1);

      const value2: string = '[test-value-2]';
      component.form.get(component.fieldName).setValue(value2);
      expect(receivedValue).toBe(value2);
    });

    it('should get field active status via fieldActive$()', () => {
      let receivedStatus: boolean;
      component.fieldActive$(component.fieldName).subscribe(
        val => receivedStatus = val,
        fail,
      );
      expect(receivedStatus).toBe(true, 'initial value');

      component.form.get(component.fieldName).enable();
      expect(receivedStatus).toBe(true);

      component.form.get(component.fieldName).disable();
      expect(receivedStatus).toBe(false);

      component.form.get(component.fieldName).enable();
      expect(receivedStatus).toBe(true);
    });

    describe('toggleControl()', () => {
      it('should toggle control status', () => {
        expect(component.form.get(component.fieldName).enabled).toBe(true);

        component['toggleControl'](component.fieldName, true);
        expect(component.form.get(component.fieldName).enabled).toBe(true);

        component['toggleControl'](component.fieldName, false);
        expect(component.form.get(component.fieldName).enabled).toBe(false);

        component['toggleControl'](component.fieldName, false);
        expect(component.form.get(component.fieldName).enabled).toBe(false);

        component['toggleControl'](component.fieldName, true);
        expect(component.form.get(component.fieldName).enabled).toBe(true);
      });

      it('should not throw an error if not control was found on toggleControl() call', () => {
        expect(() => {
          component['toggleControl']('[any-unknown-field-name]', true);
        }).not.toThrowError();
      });

      it('should emitEvent on toggle, if optoin provided', () => {
        const fieldName: string = component.fieldName;
        const control: AbstractControl = component.form.get(fieldName);

        let statusChangeCount: number = 0;
        control.statusChanges.subscribe(
          () => statusChangeCount++,
          fail
        );

        component['toggleControl'](fieldName, true, false);
        expect(statusChangeCount).toBe(0);

        component['toggleControl'](fieldName, false, false);
        expect(statusChangeCount).toBe(0);

        component['toggleControl'](fieldName, true, true);
        expect(statusChangeCount).toBe(1);

        component['toggleControl'](fieldName, false, true);
        expect(statusChangeCount).toBe(2);
      });

      it('should enableControl()', () => {
        component.form.get(component.fieldName).disable();
        expect(component.form.get(component.fieldName).disabled).toBe(true, 'self-test');

        component['enableControl'](component.fieldName);
        expect(component.form.get(component.fieldName).enabled).toBe(true);

        component['enableControl'](component.fieldName);
        expect(component.form.get(component.fieldName).enabled).toBe(true);
      });

      it('should disableControl()', () => {
        component.form.get(component.fieldName).enable();
        expect(component.form.get(component.fieldName).enabled).toBe(true, 'self-test');

        component['disableControl'](component.fieldName);
        expect(component.form.get(component.fieldName).enabled).toBe(false);

        component['disableControl'](component.fieldName);
        expect(component.form.get(component.fieldName).enabled).toBe(false);
      });
    });

    describe('with mocked SessionStorageService', () => {
      let storage: SessionStorageService;

      beforeEach(() => {
        storage = TestBed.get(SessionStorageService);
      });

      it('should get initial data', () => {
        const initialData: FormDataInterface = {
          '[test-field-name]': 'some-value'
        };
        spyOn(storage, 'retrieve').and.returnValue(initialData);
        expect(component['initialData']).toBe(initialData);
      });

      // it('should set/get value if formStorageKey has been setted', () => {
      //   const data: FormDataInterface = {
      //     '[test-field-name]': 'some-value'
      //   };
      //   spyOn(storage, 'retrieve').and.returnValue(data);
      //   spyOn(storage, 'store');
      //   component.formStorageKey = '[test-formStorageKey]';
      //
      //   component['storageData'] = data;
      //   expect(storage.store).toHaveBeenCalledWith(component.formStorageKey, data);
      //
      //   expect(component['storageData']).toBe(data);
      // });

      // it('should not set/get valud to storage if formStorageKey is falsy', () => {
      //   const data: FormDataInterface = {
      //     '[test-field-name]': 'some-value'
      //   };
      //   spyOn(storage, 'retrieve').and.returnValue(data);
      //   spyOn(storage, 'store');
      //   component.formStorageKey = null;
      //
      //   expect(() => {
      //     component['storageData'] = data;
      //   }).toThrowError();
      //   expect(storage.store).not.toHaveBeenCalled();
      //   expect(component['storageData']).toBeFalsy();
      // });

      it('should save form data to storage with saveDataToStorage()', () => {
        spyOn(storage, 'store');
        component.saveDataToStorage();
        expect(storage.store).toHaveBeenCalledWith(component.formStorageKey, component['getFormValuesFormatted'](false));
      });

      it('should flush the storage with flushDataStorage()', () => {
        spyOn(storage, 'clear');
        component['flushDataStorage']();
        expect(storage.clear).toHaveBeenCalledTimes(1);
      });
    });

    it('should check scrollToError', async () => {
      const scrollErrorRef: HTMLElement = component.testScrollToErrorRef();
      spyOn(scrollErrorRef, 'scrollIntoView');
      component['scrollToError'](component.el.nativeElement);
      expect(scrollErrorRef.scrollIntoView).not.toHaveBeenCalled(); // testing async working
      fixture.detectChanges();
      await fixture.whenStable();
      expect(scrollErrorRef.scrollIntoView).toHaveBeenCalledTimes(1);
    });

    describe('getFormValuesFormatted()', () => {
      it('should check getFormValuesFormatted()', () => {
        const value: string = '[test-value]';
        component.form.get(component.fieldName).setValue(value);
        expect(component['getFormValuesFormatted'](false)).toEqual({
          [component.fieldName]: value
        } as any);
      });

      it('should check dates in getFormValuesFormatted()', () => {
        const value: Date = new Date(1999, 6, 4);
        component.form.get(component.fieldName).setValue(value);
        expect(component['getFormValuesFormatted'](false)).toEqual({
          [component.fieldName]: '04.07.1999'
        } as any);
      });
    });

    it('should check (recursive) values in convertDatesToStrings()', () => {
      const values: FormValues = {
        flat1: new Date().toISOString(),
        flat2: new Date(),
        nested: {
          nested1: new Date().toISOString(),
          nested2: new Date(),
        }
      };

      component['convertDatesToStrings'](values);
      expect(typeof values['flat1']).toBe('string');
      expect(typeof values['flat2']).toBe('string');
      expect(typeof values['nested']['nested1']).toBe('string');
      expect(typeof values['nested']['nested2']).toBe('string');
    });

    describe('markFormGroupTouched()', () => {
      it('should check markFormGroupTouched() with flat form group', () => {
        const formGroup: FormGroup = component.formBuilder.group({
          '1stField': false,
          '2ndField': true,
          '3rdField': null
        });
        expect(formGroup.get('1stField').touched).toBeFalsy();
        expect(formGroup.get('2ndField').touched).toBeFalsy();
        expect(formGroup.get('3rdField').touched).toBeFalsy();

        component['markFormGroupTouched'](formGroup.controls);
        expect(formGroup.get('1stField').touched).toBeTruthy();
        expect(formGroup.get('2ndField').touched).toBeTruthy();
        expect(formGroup.get('3rdField').touched).toBeTruthy();
      });

      it('should check markFormGroupTouched() with nested form group', () => {
        const formGroup: FormGroup = component.formBuilder.group({
          '1stGroup': component.formBuilder.group({
            field1: 'value1'
          }),
          '2ndGroup': component.formBuilder.group({
            field2: 'value2'
          }),
          '3rdField': component.formBuilder.group({
            field3: 'value3'
          }),
        });
        expect(formGroup.get('1stGroup').get('field1').touched).toBeFalsy();
        expect(formGroup.get('2ndGroup').get('field2').touched).toBeFalsy();
        expect(formGroup.get('3rdField').get('field3').touched).toBeFalsy();

        component['markFormGroupTouched'](formGroup.controls);
        expect(formGroup.touched).toBeTruthy();
        expect(formGroup.get('1stGroup').get('field1').touched).toBeTruthy();
        expect(formGroup.get('2ndGroup').get('field2').touched).toBeTruthy();
        expect(formGroup.get('3rdField').get('field3').touched).toBeTruthy();
      });

      it('should not fail when controls are nulls markFormGroupTouched()', () => {
        const values: FormControlsType = {
          '1stControl': null,
          '2ndControl': new FormControl(),
        };
        expect(() => {
          component['markFormGroupTouched'](values);
        }).not.toThrowError();
        expect(values['2ndControl'].touched).toBe(true);
      });
    });

    it('should check stringToDate()', () => {
      const date: Date = new Date(1999, 10, 24);
      expect(component['stringToDate'](date.toISOString()).toISOString())
        .toContain('1999', 'accept string as argument');
      expect(component['stringToDate'](date).toISOString())
        .toContain('1999', 'accept Date as argument');
    });

    it('should not fail on "junky" values in convertDatesToStrings()', () => {
      expect(() => {
        component['convertDatesToStrings']({
          junkField: 'junkValue'
        });
      }).not.toThrowError();
    });
  });
});
*/
