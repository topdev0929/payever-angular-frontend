// tslint:disable max-classes-per-file

import { Component, NgModule, Injector, ViewChild, forwardRef, ElementRef, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, AbstractControl, NG_VALUE_ACCESSOR, NgControl, Validators } from '@angular/forms';

import { AbstractValueAccessorFieldComponent } from './abstract-value-accessor-field.component';
import { nonRecompilableTestModuleHelper } from '../../../test';
import { ComponentFixture, TestBed } from '@angular/core/testing';

@Component({
  selector: 'test-value-accessor-client',
  template: `
    <input
      #input
      ngDefaultControl
      type="text"
      [formControl]="formControl"
      (focus)="onFocus($event)"
    />
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TestInput),
      multi: true
    }
  ]
})
class TestInput extends AbstractValueAccessorFieldComponent implements OnInit {
  @ViewChild('input', { static: true }) input: ElementRef;

  constructor(protected injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.formControl.valueChanges
      .pipe(this.takeUntilDestroyed())
      .subscribe(() => this.onControlChange(this.formControl.value));
  }

  getNgControl(): NgControl {
    return this.ngControl;
  }
}

@Component({
  selector: 'test-value-accessor-form',
  template: `
    <form [formGroup]="formGroup">
      <test-value-accessor-client
        #control
        [formControl]="formControl"
      ></test-value-accessor-client>
    </form>
  `
})
class TestForm {

  fieldName: string = '[test-fieldName]';

  formGroup: FormGroup = this.formBuilder.group({
    [this.fieldName]: null
  });

  get formControl(): AbstractControl {
    return this.formGroup.get(this.fieldName);
  }

  @ViewChild('control', { static: true }) control: TestInput;

  constructor(
    public formBuilder: FormBuilder
  ) {}

}

@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [
    TestInput,
    TestForm
  ],
})
class TestModule {}

describe('AbstractValueAccessorFieldComponent', () => {
  let fixture: ComponentFixture<TestForm>;
  let component: TestInput;
  let form: TestForm;

  nonRecompilableTestModuleHelper({
    imports: [TestModule]
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestForm);
    form = fixture.componentInstance;
    component = form.control;

  });

  describe('with not initiated component', () => {
    it('should not fail on syncErrors() call on not-initiated', () => {
      try {
        expect(component.getNgControl()).toBeFalsy();
        (component.input.nativeElement as HTMLInputElement).focus();
        (component.input.nativeElement as HTMLInputElement).dispatchEvent(new FocusEvent('focus'));
      } catch (e) {
        expect(e).toBeFalsy('No error shoud be thrown');
      }
    });
  });

  describe('with initiated component', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should create component', () => {
      expect(component).toBeTruthy();
      expect(component.getNgControl()).toBeTruthy();
      expect(component.getNgControl() instanceof NgControl).toBe(true);
    });

    it('should set touched', () => {
      expect(component.formControl.touched).toBe(false, 'initial value should be false');

      component.touched = true;
      expect(component.formControl.touched).toBe(true);

      component.touched = false;
      expect(component.formControl.touched).toBe(false);
    });

    it('should get controlQaId()', () => {
      expect(component.controlQaId).toBe(`control.${form.fieldName}`);
    });

    it('should make component "touched" when focused', () => {
      expect(form.formControl.touched).toBe(false);
      (component.input.nativeElement as HTMLInputElement).focus();
      (component.input.nativeElement as HTMLInputElement).dispatchEvent(new FocusEvent('focus'));
      fixture.detectChanges();
      expect(form.formControl.touched).toBe(true);
    });

    it('should set value within writeValue()', () => {
      let changed: boolean = false;
      component.valueChange.subscribe(
        () => changed = true,
        fail
      );
      expect(component.formControl.value).toBeNull();
      const value: string = '[test-value]';
      component.writeValue(value);
      expect(component.formControl.value).toBe(value);
      expect(changed).toBe(false);
      expect(form.formControl.value).toBeNull(); // <-- should not work because has inner formControl
    });

    it('should set callback with registerOnChange()', () => {
      let changeEmittedValue: any = null;
      component.registerOnChange((value: any) => changeEmittedValue = value);
      expect(changeEmittedValue).toBe(null);

      const newValue: string = '[new-value]';
      (component.input.nativeElement as HTMLInputElement).value = newValue;
      component.input.nativeElement.dispatchEvent(new Event('input'));
      expect(changeEmittedValue).toBe(newValue);
    });

    it('should call default onChangeCallback() without any error', () => {
      try {
        const newValue: string = '[new-value-default-on-change]';
        (component.input.nativeElement as HTMLInputElement).value = newValue;
        component.input.nativeElement.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        expect(component.formControl.value).toBe(newValue);
      } catch (e) {
        expect(e).toBeFalsy('No errors should be thrown');
      }
    });

    it('should set callback with registerOnTouched()', () => {
      let wasTouched: boolean = false;
      component.registerOnTouched(() => wasTouched = true);
      expect(wasTouched).toBe(false);

      component.input.nativeElement.dispatchEvent(new FocusEvent('focus'));
      fixture.detectChanges();
      expect(wasTouched).toBe(true);
    });

    it('should call onTouchedCallback() without any error', () => {
      try {
        component.input.nativeElement.dispatchEvent(new FocusEvent('focus'));
        fixture.detectChanges();
      } catch (e) {
        expect(e).toBeFalsy('No errors should be thrown');
      }
    });

    it('should sync errors', () => {
      form.formControl.setValidators([Validators.required]);
      (component.input.nativeElement as HTMLInputElement).value = '';
      component.input.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(component.formControl.errors).toEqual({ required: true });
    });
  });
});
