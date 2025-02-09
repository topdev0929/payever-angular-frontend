// tslint:disable max-classes-per-file

import { Component, Input, NgModule, EventEmitter, Injector, DebugElement, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule, FormsModule, AbstractControl } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbstractFieldComponent } from './abstract-field.component';
import { AddonInterface, AddonType, AddonStyle } from '../addon';
/*
import { nonRecompilableTestModuleHelper } from '../../../test';
import { ErrorStateMatcherInterface } from '../../interfaces';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import { Observable, Subject } from 'rxjs';

// NOTE: Cannot test [required] field here because of non-fixed
// `ExpressionChangedAfterItHasBeenCheckedError` error:
// https://github.com/angular/angular/issues/23657

@Component({
  selector: 'test-abstract-field-client-component',
  template: `
    <test-fake-addon *ngIf="addonPrepend" [addon]="addonPrepend"></test-fake-addon>
    <input
      *ngIf="formControl"
      type="text"
      class="test-input"
      [attr.qa-id]="controlQaId"
      [formControl]="formControl"
    />
    <test-fake-addon *ngIf="addonAppend" [addon]="addonAppend"></test-fake-addon>
  `,
})
class TestAbstractFieldClientComponent extends AbstractFieldComponent {
  constructor(
    injector: Injector,
  ) {
    super(injector);
  }

  subscribeUntilDestroyed<T>(observable: Observable<T>): Subject<T> {
    const subject: Subject<T> = new Subject();
    observable.pipe(this.takeUntilDestroyed()).subscribe(subject);
    return subject;
  }
}

@Component({
  selector: 'test-abstract-field-host-component',
  template: `
    <form [formGroup]="formGroup">
      <test-abstract-field-client-component
        #abstractClientComponent
        [addonAppend]="addonAppend"
        [addonPrepend]="addonPrepend"
        [errorStateMatcher]="errorStateMatcher"
        [formControlRef]="formControlRef"
        [disabled]="disabled"
        [scopeQaId]="scopeQaId"
        (valueChange)="valueChange.emit($event)"
        (focus)="focus.emit($event)"
        (blur)="blur.emit($event)"
      >
      </test-abstract-field-client-component>
    </form>
  `
})
class TestAbstractFieldHostComponent {
  addonAppend: AddonInterface;
  addonPrepend: AddonInterface;
  disabled: boolean;
  scopeQaId: string;
  valueChange: EventEmitter<any> = new EventEmitter();
  focus: EventEmitter<any> = new EventEmitter();
  blur: EventEmitter<any> = new EventEmitter();

  disableFormControl: boolean = false;
  controlName: string = '[test-control-name]';
  errorStateMatcher: ErrorStateMatcherInterface;
  formGroup: FormGroup = this.formBuilder.group({
    [this.controlName]: null
  });

  @ViewChild('abstractClientComponent', { static: true }) abstractFieldClientComponent: TestAbstractFieldClientComponent;

  get formControlRef(): AbstractControl {
    return !this.disableFormControl ? this.formGroup.get(this.controlName) : null;
  }

  constructor(
    public formBuilder: FormBuilder,
  ) { }
}

@Component({
  selector: 'test-fake-addon',
  template: `
    <span [ngClass]="addon?.className">{{ addon?.text }}</span>
  `
})
class TestFakeAddon {
  @Input() addon: AddonInterface;
}

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [
    TestAbstractFieldClientComponent,
    TestAbstractFieldHostComponent,
    TestFakeAddon,
  ],
})
class TestModule { }

describe('AbstractFieldComponent', () => {
  let fixture: ComponentFixture<TestAbstractFieldHostComponent>;
  let component: TestAbstractFieldHostComponent;

  nonRecompilableTestModuleHelper({
    imports: [ TestModule ]
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestAbstractFieldHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component instance', () => {
    expect(component).toBeTruthy();
  });

  it('should provide addonAppend', () => {
    let renderedAddonAppend: DebugElement;

    const addonAppend: AddonInterface = {
      addonType: AddonType.Text,
      text: 'addonAppend',
      className: 'test-addon-append'
    };
    component.addonAppend = addonAppend;
    fixture.detectChanges();
    renderedAddonAppend = fixture.debugElement.query(By.css(`.${addonAppend.className}`));
    expect(component.abstractFieldClientComponent.hasAddonAppend).toBe(true);
    expect(renderedAddonAppend).toBeTruthy();
    expect((renderedAddonAppend.nativeElement as HTMLSpanElement).innerText.trim()).toBe(addonAppend.text);

    component.addonAppend = null;
    fixture.detectChanges();
    expect(component.abstractFieldClientComponent.hasAddonAppend).toBe(false);
    renderedAddonAppend = fixture.debugElement.query(By.css(`.${addonAppend.className}`));
    expect(renderedAddonAppend).toBeFalsy();
  });

  it('should check isAddonStyleFilled getter', () => {
    expect(component.abstractFieldClientComponent.addonAppend).toBeFalsy('self-test');
    expect(component.abstractFieldClientComponent.isAddonStyleFilled).toBe(false, 'by default');

    const addonAppend: AddonInterface = {
      addonType: AddonType.Text,
      text: 'addonAppend',
    };
    component.addonAppend = addonAppend;
    fixture.detectChanges();
    expect(component.abstractFieldClientComponent.isAddonStyleFilled).toBe(false);

    component.addonAppend.addonStyle = AddonStyle.Filled;
    fixture.detectChanges();
    expect(component.abstractFieldClientComponent.isAddonStyleFilled).toBe(true);

    component.addonAppend.addonStyle = AddonStyle.Default;
    fixture.detectChanges();
    expect(component.abstractFieldClientComponent.isAddonStyleFilled).toBe(false);
  });

  it('should provide addonPrepend', () => {
    let renderedAddonPrepend: DebugElement;

    const addonPrepend: AddonInterface = {
      addonType: AddonType.Text,
      text: 'addonPrepend',
      className: 'test-addon-prepend'
    };
    component.addonPrepend = addonPrepend;
    fixture.detectChanges();
    expect(component.abstractFieldClientComponent.hasAddonPrepend).toBe(true);
    renderedAddonPrepend = fixture.debugElement.query(By.css(`.${addonPrepend.className}`));
    expect(renderedAddonPrepend).toBeTruthy();
    expect((renderedAddonPrepend.nativeElement as HTMLSpanElement).innerText.trim()).toBe(addonPrepend.text);

    component.addonPrepend = null;
    fixture.detectChanges();
    expect(component.abstractFieldClientComponent.hasAddonPrepend).toBe(false);
    renderedAddonPrepend = fixture.debugElement.query(By.css(`.${addonPrepend.className}`));
    expect(renderedAddonPrepend).toBeFalsy();
  });

  it('should synchronise [disabled] property with formControl', () => {
    component.disableFormControl = true;
    component.disabled = true;
    fixture.detectChanges();
    expect(component.abstractFieldClientComponent.disabled).toBe(false);

    component.disabled = false; // force 'disabled' to be changed
    component.disableFormControl = false;
    fixture.detectChanges();
    expect(component.formControlRef.disabled).toBe(false, 'self-test');

    component.disabled = true;
    fixture.detectChanges();
    expect(component.abstractFieldClientComponent.disabled).toBe(true);
    expect(component.formControlRef.disabled).toBe(true);

    component.disabled = false;
    fixture.detectChanges();
    expect(component.abstractFieldClientComponent.disabled).toBe(false);
    expect(component.formControlRef.disabled).toBe(false);
  });

  it('should return null for [disabled] property without formControl', () => {
    expect(component.abstractFieldClientComponent.disabled).toBe(false);
    component.disableFormControl = true;
    fixture.detectChanges();
    expect(component.abstractFieldClientComponent.disabled).toBe(false);
    component.disableFormControl = false;
    fixture.detectChanges();
    expect(component.abstractFieldClientComponent.disabled).toBe(false);
  });

  it('should emit "focus" event', () => {
    let focused: boolean = false;
    component.focus.subscribe(
      () => focused = true,
      fail
    );
    expect(focused).toBe(false);
    component.abstractFieldClientComponent.onFocus(new FocusEvent('focus'));
    expect(focused).toBe(true);
  });

  it('should emit "blur" event', () => {
    let blurred: boolean = false;
    component.blur.subscribe(
      () => blurred = true,
      fail
    );
    expect(blurred).toBe(false);
    component.abstractFieldClientComponent.onBlur(new FocusEvent('blur'));
    expect(blurred).toBe(true);
  });

  it('should check isErrorState()', () => {
    const errorStateMatcher: jasmine.SpyObj<ErrorStateMatcherInterface> = jasmine
      .createSpyObj('errorStateMatcher', ['isErrorState']);
    errorStateMatcher.isErrorState.and.returnValues(
      true,
      false
    );

    expect(component.errorStateMatcher).toBeFalsy();
    fixture.detectChanges();
    expect(component.abstractFieldClientComponent.isErrorState).toBe(false, 'by default');

    component.errorStateMatcher = errorStateMatcher;
    component.disableFormControl = true;
    fixture.detectChanges();
    expect(component.abstractFieldClientComponent.isErrorState).toBe(false, 'without formControl');

    component.disableFormControl = false;
    fixture.detectChanges();

    expect(component.abstractFieldClientComponent.isErrorState).toBe(true);
    expect(component.abstractFieldClientComponent.isErrorState).toBe(false);
  });

  it('should check controlQaId() getter', () => {
    const controlName: string = component.controlName;

    component.disableFormControl = true;
    fixture.detectChanges();
    expect(component.abstractFieldClientComponent.controlQaId).toBe('', 'without formControl');

    component.disableFormControl = false;
    component.scopeQaId = '';
    fixture.detectChanges();
    expect(component.abstractFieldClientComponent.controlQaId)
      .toBe(`control.${controlName}`, 'without formControl');

    const scopeQaId: string = '[test-scopeQaId]';
    component.scopeQaId = scopeQaId;
    fixture.detectChanges();
    expect(component.abstractFieldClientComponent.controlQaId)
      .toBe(`control.${scopeQaId}.${controlName}`, 'within formControl');

    const parentGroupName: string = '[parent-test-group-name]';
    const parentFormGroup: FormGroup = component.formBuilder.group({
      [parentGroupName]: component.formGroup
    });
    expect(parentFormGroup.get(parentGroupName)).toBe(component.formGroup, 'self-test');
    fixture.detectChanges();
    expect(component.abstractFieldClientComponent.controlQaId)
      .toBe(`control.${scopeQaId}.${parentGroupName}.${controlName}`, 'inside parent formGroup');
  });

  it('should additinally test .getFullControlName() static method', () => {
    const postfix: string = '[test-control-name-prefix]';
    expect(AbstractFieldComponent.getFullControlName(null, postfix))
      .toBe(postfix);

    expect(AbstractFieldComponent.getFullControlName(component.formControlRef, postfix))
      .toBe(`${component.controlName}${postfix}`);
  });

  it('should validate takeUntilDestroyed() helper', () => {
    const subject: Subject<boolean> = new Subject();

    const componentObservable: Observable<boolean> = component.abstractFieldClientComponent
      .subscribeUntilDestroyed<boolean>(subject);

    let count: number = 0;
    componentObservable.subscribe(
      () => count++,
      fail
    );

    subject.next(true);
    expect(count).toBe(1);

    subject.next(true);
    expect(count).toBe(2, 'self-test');

    fixture.destroy();

    subject.next(true);
    expect(count).toBe(2, 'still should be 2');
  });
});*/
