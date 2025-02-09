import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Injector, DebugElement } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { FormGroup, AbstractControl, Validators, ValidationErrors } from '@angular/forms';
import { MatDatepickerInputEvent, MatDatepicker } from '@angular/material/datepicker';
/*
import { FormAbstractComponent } from '../../../form-abstract';
import { ErrorBag } from '../../../../services';
import { FormSchemeField, FormScheme } from '../../../../interfaces';
import { nonRecompilableTestModuleHelper } from '../../../../test';
import { FormModule } from '../../../../form.module';
import { TranslateStubService, LANG, I18nModule } from '../../../../../i18n';
import { DatepickerComponent } from './datepicker.component';
import { DatepickerChangeEvent } from '../../interfaces';
import { DatepickerMode, DatepickerStartView } from '../../enums';
import { DatePresets } from '../../constants';
import { FormFieldsetComponent } from '../../../form-fieldset/form-fieldset.component';

interface DatepickerFormDataInterface {
  date: Date;
}

@Component({
  template: `<form novalidate (ngSubmit)="onSubmit" [formGroup]="form" *ngIf="form">
    <pe-form-fieldset
      [translationScope]="formTranslationsScope"
      [isSubmitted]="isSubmitted"
      [fields]="formScheme.fieldsets[fieldsetName]"
      [errors]="errors$ | async"
      [formGroup]="form">
    </pe-form-fieldset>
  </form>`
})
class DatepickerFormComponent extends FormAbstractComponent<DatepickerFormDataInterface> {

  fieldsetName: string = 'mainTestFieldset';
  formStorageKey: string = 'test.DatepickerFormComponent';
  formTranslationsScope: string = 'test.DatepickerFormComponent.formTranslationsScope';

  fieldset: FormSchemeField[] = [
    {
      type: 'date',
      name: 'date',
    }
  ];

  formScheme: FormScheme = {
    fieldsets: {
      [this.fieldsetName]: this.fieldset
    }
  };

  form: FormGroup = this.formBuilder.group({
    date: null
  });

  constructor(
    protected errorBag: ErrorBag,
    protected injector: Injector
  ) {
    super(injector);
  }

  createForm(): void {
    // stub method
  }

  onUpdateFormData(): void {
    // stub method
  }

  onSuccess(): void {
    // stub method
  }

  toggleDateControl(value: boolean): void {
    this.toggleControl('date', value);
  }
}

describe('DatepickerComponent', () => {
  let fixture: ComponentFixture<DatepickerFormComponent>;
  let component: DatepickerFormComponent;

  const DEFAULT_DATE: string = '2018 01 01';

  nonRecompilableTestModuleHelper({
    declarations: [DatepickerFormComponent],
    imports: [
      NoopAnimationsModule,
      I18nModule.forRoot(),
      FormModule
    ],
    providers: [
      { provide: LANG, useValue: 'en' },
      TranslateStubService.provide(),
    ]
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DatepickerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function getDate(): FormSchemeField {
    return component.fieldset.find(fs => fs.name === 'date');
  }

  function openDatepicker(): void {
    fixture.debugElement.query(By.css('mat-datepicker')).componentInstance.open();
    fixture.detectChanges();
  }

  describe('Constructor', () => {
    it('should create component instance', () => {
      expect(component).toBeDefined();
    });

    it('should render form', () => {
      const toggler: DebugElement = fixture.debugElement.query(By.css('form'));
      expect(toggler).not.toBeNull('Form should be rendered');
    });
  });

  describe('Functionality', () => {
    let datepickerComponent: DatepickerComponent;
    let datepickerInput: DebugElement;
    let datepickderInputElement: HTMLInputElement;

    beforeEach(() => {
      datepickerInput = fixture.debugElement.query(By.css('.pe-datepicker-input'));
      datepickderInputElement = datepickerInput.nativeElement;
      datepickerComponent = fixture.debugElement.query(By.css('pe-datepicker')).componentInstance;
    });

    it('should invoke focus()/blur() events', () => {
      spyOn(datepickerComponent, 'onFocus');
      spyOn(datepickerComponent, 'onBlur');

      expect(datepickerComponent.onFocus).not.toHaveBeenCalled();
      datepickderInputElement.dispatchEvent(new Event('focus'));
      fixture.detectChanges();
      expect(datepickerComponent.onFocus).toHaveBeenCalled();

      expect(datepickerComponent.onBlur).not.toHaveBeenCalled();
      datepickderInputElement.dispatchEvent(new Event('blur'));
      fixture.detectChanges();
      expect(datepickerComponent.onBlur).toHaveBeenCalled();
    });

    it('should set startView when passed', () => {
      expect(datepickerComponent.startView).toBe(DatepickerStartView.Month, '"month" startView should be set by default');

      getDate().dateSettings = { startView: DatepickerStartView.Year };
      fixture.detectChanges();
      expect(datepickerComponent.startView).toBe(DatepickerStartView.Year);

      getDate().dateSettings = { startView: DatepickerStartView.MultyYear };
      fixture.detectChanges();
      expect(datepickerComponent.startView).toBe(DatepickerStartView.MultyYear);
    });

    it('should show picker with years when startView is MultyYear', () => {
      getDate().dateSettings = { startView: DatepickerStartView.MultyYear };
      openDatepicker();
      fixture.detectChanges();
      expect(!!fixture.debugElement.query(By.css('mat-multi-year-view'))).toBeTruthy('Show see year picker');
      expect(!!fixture.debugElement.query(By.css('mat-year-view'))).toBeFalsy('Show NOT see month picker');
      expect(!!fixture.debugElement.query(By.css('mat-month-view'))).toBeFalsy('Show NOT see day picker');
    });

    it('should show picker with months when startView is Year', () => {
      getDate().dateSettings = { startView: DatepickerStartView.Year };
      openDatepicker();
      fixture.detectChanges();
      expect(!!fixture.debugElement.query(By.css('mat-multi-year-view'))).toBeFalsy('Show NOT see year picker');
      expect(!!fixture.debugElement.query(By.css('mat-year-view'))).toBeTruthy('Show see month picker');
      expect(!!fixture.debugElement.query(By.css('mat-month-view'))).toBeFalsy('Show NOT see day picker');
    });

    it('should show picker with days when startView is Month', () => {
      getDate().dateSettings = { startView: DatepickerStartView.Month };
      openDatepicker();
      fixture.detectChanges();
      expect(!!fixture.debugElement.query(By.css('mat-multi-year-view'))).toBeFalsy('Show NOT see year picker');
      expect(!!fixture.debugElement.query(By.css('mat-year-view'))).toBeFalsy('Show NOT see month picker');
      expect(!!fixture.debugElement.query(By.css('mat-month-view'))).toBeTruthy('Show see day picker');
    });

    it('should not see day picker when mode is MonthYear', () => {
      getDate().dateSettings = { mode: DatepickerMode.MonthYear, startView: DatepickerStartView.MultyYear };
      openDatepicker();
      expect(!!fixture.debugElement.query(By.css('mat-multi-year-view .mat-calendar-body-cell'))).toBeTruthy('Show see year picker');
      expect(!!fixture.debugElement.query(By.css('mat-year-view .mat-calendar-body-cell'))).toBeFalsy('Show NOT see month picker 1');
      expect(!!fixture.debugElement.query(By.css('mat-month-view .mat-calendar-body-cell'))).toBeFalsy('Show NOT see day picker');

      // Click on first year in datepicker
      fixture.debugElement.query(By.css('mat-multi-year-view .mat-calendar-body-cell')).triggerEventHandler('click', null);
      fixture.detectChanges();
      expect(!!fixture.debugElement.query(By.css('mat-multi-year-view .mat-calendar-body-cell'))).toBeFalsy('Show NOT see year picker');
      expect(!!fixture.debugElement.query(By.css('mat-year-view .mat-calendar-body-cell'))).toBeTruthy('Show see month picker');
      expect(!!fixture.debugElement.query(By.css('mat-month-view .mat-calendar-body-cell'))).toBeFalsy('Show NOT see day picker');

      // Click on first month in datepicker
      fixture.debugElement.query(By.css('mat-year-view .mat-calendar-body-cell')).triggerEventHandler('click', null);
      fixture.detectChanges();
      expect(!!fixture.debugElement.query(By.css('mat-multi-year-view .mat-calendar-body-cell'))).toBeFalsy('Show NOT see year picker');
      // TODO Datepicker should disappear and it disappears in debugger but still presented in fixture. Need to research and fix
      // expect(!!fixture.debugElement.query(By.css('mat-year-view .mat-calendar-body-cell'))).toBeFalsy('Show NOT see month picker 2');
      expect(!!fixture.debugElement.query(By.css('mat-month-view .mat-calendar-body-cell'))).toBeFalsy('Show NOT see day picker');
    });

    it('should set "mode" when passed', () => {
      expect(datepickerComponent.mode).toBe(DatepickerMode.Date, '"date" mode should be set by default');

      getDate().dateSettings = { mode: DatepickerMode.MonthYear };
      fixture.detectChanges();
      expect(datepickerComponent.mode).toBe(DatepickerMode.MonthYear, '"month-year" mode should be set after setting change');

      getDate().dateSettings = { mode: DatepickerMode.Date };
      fixture.detectChanges();
      expect(datepickerComponent.mode).toBe(DatepickerMode.Date, '"dater" mode should be set after setting return');
    });

    it('should pass custom filter for dates', () => {
      expect(datepickerComponent.filter).toBeNull('Filter should not be setted initially');
      const filter: (date: Date | null) => boolean = () => false;

      getDate().dateSettings = { filter };
      fixture.detectChanges();

      expect(datepickerComponent.filter).toBe(filter);
    });

    it('should pass placeholder when provided', () => {
      const formFieldsetComponent: FormFieldsetComponent = fixture.debugElement
        .query(By.css('pe-form-fieldset'))
        .componentInstance;
      const defaultPlaceholder: string = formFieldsetComponent.getPlaceholder(
        getDate()
      );
      expect(datepickerComponent.placeholder).toBe(defaultPlaceholder, 'placeholder should be defined by default');

      const placeholder: string = 'CUSTOM_DATE_FIELD_PLACEHOLDER';
      getDate().dateSettings = { placeholder };
      fixture.detectChanges();

      expect(datepickerComponent.placeholder).toBe(placeholder, 'placeholder should be defined after passing');
      expect(datepickerInput.attributes.placeholder).toBe(placeholder, 'placeholder should be defined after passing');
      expect(datepickderInputElement.placeholder).toBe(placeholder);
    });
  });

  describe('Validation', () => {
    let datepickerControl: AbstractControl;
    let datepickerComponent: DatepickerComponent;
    const min: Date = DatePresets.adultDateOfBirth.min;
    const max: Date = DatePresets.adultDateOfBirth.max;

    beforeEach(() => {
      datepickerControl = component.form.get('date');
      datepickerComponent = fixture.debugElement.query(By.css('pe-datepicker')).componentInstance;
    });

    it('should render datepicker component', () => {
      expect(datepickerComponent).toBeDefined('DatepickerComponent should be found');
    });

    it('should not accept value greater than max', () => {
      expect(datepickerControl.valid).toBeTruthy('Should be valid initially');

      getDate().dateSettings = { max };
      fixture.detectChanges();

      expect(datepickerComponent.max).toEqual(max);

      const greaterThanMax: Date = new Date(max);
      greaterThanMax.setFullYear(greaterThanMax.getFullYear() + 1);
      datepickerControl.setValue(greaterThanMax);

      expect(datepickerControl.valid).toBeFalsy('Date should NOT be valid');
      expect(datepickerControl.errors).not.toBeNull();
      expect(datepickerControl.errors.matDatepickerMax).toBeDefined('matDatepickerMax should be presented');

      getDate().dateSettings = { max, min };
      fixture.detectChanges();
      datepickerControl.setValue(greaterThanMax);
      expect(datepickerControl.valid).toBeFalsy('Date should NOT be valid within "min" setting');
    });

    it('should not accept value greater than min', () => {
      expect(datepickerControl.valid).toBeTruthy('Should be valid initially');

      getDate().dateSettings = { min };
      fixture.detectChanges();

      expect(datepickerComponent.min).toEqual(min);

      const lessThanMin: Date = new Date(min);
      lessThanMin.setFullYear(lessThanMin.getFullYear() - 1);
      datepickerControl.setValue(lessThanMin);

      expect(datepickerControl.valid).toBeFalsy('Date should NOT be valid');
      expect(datepickerControl.errors).not.toBeNull();
      expect(datepickerControl.errors.matDatepickerMin).toBeDefined('matDatepickerMax should be presented');

      getDate().dateSettings = { min, max };
      fixture.detectChanges();
      datepickerControl.setValue(lessThanMin);
      expect(datepickerControl.valid).toBeFalsy('Date should NOT be valid within "max" property');
    });

    it('should check Validators.required', () => {
      expect(component.form.valid).toBeTruthy('Form should be valid by default');

      datepickerControl.setValidators(Validators.required);
      component.form.updateValueAndValidity();
      datepickerControl.setValue('');
      component.onSubmit();

      expect(component.form.valid).not.toBeTruthy('Form should NOT be valid');
      const expectingErrors: ValidationErrors = { required: true };
      expect(datepickerControl.errors).toEqual(expectingErrors, 'Error should have special format');
    });

    it('should be valid if no validation provided', () => {
      datepickerControl.setValidators([]);
      component.form.updateValueAndValidity();
      datepickerControl.setValue('');
      component.onSubmit();

      expect(component.form.valid).toBeTruthy('Form should be valid');
      expect(datepickerControl.valid).toBeTruthy('Control should be valid');
    });

    it('shoud change year within chosenYearHandler() in DatepickerMode.MonthYear mode', () => {
      const currentYear: Date = new Date(DEFAULT_DATE);
      const nextYear: Date = new Date(currentYear);
      nextYear.setFullYear(nextYear.getFullYear() + 1);

      datepickerControl.setValue(currentYear);
      expect(datepickerControl.value).toEqual(currentYear);

      datepickerComponent.valueChange.subscribe(
        (evt: DatepickerChangeEvent) => expect(evt.value).toEqual(nextYear, 'should notice about next year changed'),
        fail
      );

      datepickerComponent.mode = DatepickerMode.MonthYear;
      datepickerComponent.chosenYearHandler(nextYear);
      expect(datepickerControl.value).toEqual(nextYear);
    });

    it('shoud change month within chosenMonthHandler() in DatepickerMode.MonthYear, and close() datepicker', () => {
      const currentMonth: Date = new Date(DEFAULT_DATE);
      const nextMonth: Date = new Date(currentMonth);
      nextMonth.setMonth(currentMonth.getMonth() + 6);

      const datepicker: MatDatepicker<Date> = datepickerComponent.datepicker;
      spyOn(datepicker, 'close');

      datepickerControl.setValue(currentMonth);
      expect((datepickerControl.value as Date).toLocaleString())
        .toEqual(currentMonth.toLocaleString());

      datepickerComponent.valueChange.subscribe(
        (evt: DatepickerChangeEvent) =>
          expect(evt.value.toLocaleString())
            .toEqual(nextMonth.toLocaleString(), 'should notice about next year changed'),
        fail
      );

      datepickerComponent.mode = DatepickerMode.MonthYear;
      fixture.detectChanges();
      expect(datepicker.close).not.toHaveBeenCalled();
      datepickerComponent.chosenMonthHandler(nextMonth);
      expect((datepickerControl.value as Date).toLocaleString())
        .toEqual(nextMonth.toLocaleString());
      expect(datepicker.close).toHaveBeenCalled();
    });

    describe('with input element', () => {
      let datepickerInput: DebugElement;
      let datepickderInputElement: HTMLInputElement;

      beforeEach(() => {
        datepickerInput = fixture.debugElement.query(By.css('.pe-datepicker-input'));
        datepickderInputElement = datepickerInput.nativeElement;
      });

      it('should be rendered', () => {
        expect(datepickerInput).not.toBeNull('datepickerInput should be rendered');
      });

      it('should set pattern error with onDateChanged() callback and do valueChange.emit() with value', () => {
        datepickerComponent.valueChange.subscribe(
          (evt: DatepickerChangeEvent) => expect(evt.value).toBeNull('component should emit "null" value'),
          fail
        );

        datepickderInputElement.value = 'abrakadabra';

        const matInputEvent: MatDatepickerInputEvent<Date> = new MatDatepickerInputEvent(
          datepickerInput.componentInstance,
          datepickderInputElement
        );
        matInputEvent.value = null;
        datepickerComponent.onDateChanged(matInputEvent);

        expect(datepickerControl.valid).toBeFalsy('Datepicker control should NOT be valid');
        const expectingError: ValidationErrors = {
          pattern: {
            valid: false
          }
        };
        expect(datepickerControl.errors).toEqual(expectingError, 'Datepicker control should produce error of special format');
      });

      it('should not set errors and emit proper value with onDateChanged()', () => {
        const value: Date = new Date(DEFAULT_DATE);

        datepickerComponent.valueChange.subscribe(
          (evt: DatepickerChangeEvent) => expect(evt.value).toEqual(value, 'component should emit "null" value'),
          fail
        );

        datepickderInputElement.value = value.toISOString();

        const matInputEvent: MatDatepickerInputEvent<Date> = new MatDatepickerInputEvent(
          datepickerInput.componentInstance,
          datepickderInputElement
        );
        matInputEvent.value = value;
        datepickerComponent.onDateChanged(matInputEvent);

        expect(datepickerControl.valid).toBeTruthy('Validation should be passed');
      });

      // NOTE: this case was commented because it fails with ExpressionChangedAfterItHasBeenCheckedError
      // caused by too many times [requried] field set. This is issues of AbstractFieldComponent.
      // Please check when it will be fixed.
      // it('should be marked as "required" when property is given', () => {
      //   expect(datepickerComponent.required).toBeFalsy('DatepickerComponent#required should NOT be setted');
      //   getDate().fieldSettings = { required: true };
      //   component.formScheme = { fieldsets: {
      //     [component.fieldsetName]: [...component.fieldset]
      //   }};
      //   datepickerControl.setValidators(Validators.required);
      //   fixture.detectChanges();
      //   expect(datepickerComponent.required).toBeTruthy('DatepickerComponent#required should be setted');
      //   expect(datepickerInput.attributes.required).toBeTruthy();
      // });
    });
  });
});*/
