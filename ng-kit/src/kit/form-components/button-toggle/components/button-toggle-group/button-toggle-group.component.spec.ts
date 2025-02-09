import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';

import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ButtonToggleGroupComponent } from './button-toggle-group.component';
import { nonRecompilableTestModuleHelper } from '../../../../test';
import { ButtonToggleInterface, ButtonToggleChangeEvent } from '../../interfaces';
import { ButtonToggleAlignment } from '../../enums';
import { ErrorStateMatcherInterface } from '../../../../form-core/interfaces';

describe('ButtonToggleGroupComponent', () => {
  let fixture: ComponentFixture<ButtonToggleGroupComponent>;
  let component: ButtonToggleGroupComponent;

  const labelSelector: string = '.button-toggle-label';
  const toggleButtonGroupSelector: string = 'mat-button-toggle-group';
  const toggleButtonWrapperSelector: string = '.mat-button-toggle-group-wrapper';
  const aligmentCenterSelector: string = '.mat-button-toggle-group-wrapper-center';
  const aligmentRightSelector: string = '.mat-button-toggle-group-wrapper-right';
  const toggleGroupWithErrorSelector: string = '.mat-button-toggle-group-error';

  nonRecompilableTestModuleHelper({
    imports: [
      FormsModule,
      ReactiveFormsModule,
      MatButtonToggleModule,
    ],
    declarations: [
      ButtonToggleGroupComponent
    ]
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonToggleGroupComponent);
    component = fixture.componentInstance;
  });

  describe('with initialized component', () => {

    beforeEach(() => {
      component.formControl = new FormControl();
      fixture.detectChanges();
    });

    it('should create a component instance', () => {
      expect(component).toBeTruthy();
    });

    it('should check getIconClass()', () => {
      expect(component.getIconClass('icon-test-12', null)).toBe('icon icon-12');
      expect(component.getIconClass(null, 45)).toBe('icon icon-45');
      expect(component.getIconClass('icon-test-12', 21)).toBe('icon icon-21');
      expect(component.getIconClass('icon-test-unknown', null)).toBe('');
      expect(component.getIconClass(null, null)).toBe('');
    });

    it('should generate svg icon template id with getIconId()', () => {
      expect(component.getIconId('icon-test')).toBe('#icon-test');
      expect(component.getIconId('')).toBe(null);
      expect(component.getIconId(null)).toBe(null);
      expect(component.getIconId(void 0)).toBe(null);
      expect(component.getIconId(0 as any)).toBe(null);
      expect(component.getIconId(1 as any)).toBe('#1');
    });

    it('should process @Input() alignment', () => {
      expect(component.alignment).toBe(ButtonToggleAlignment.Left, 'by default');

      component.alignment = ButtonToggleAlignment.Center;
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css(aligmentCenterSelector))).toBeTruthy();

      component.alignment = ButtonToggleAlignment.Right;
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css(aligmentRightSelector))).toBeTruthy();

      component.alignment = ButtonToggleAlignment.Left;
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css(toggleButtonWrapperSelector))).toBeTruthy();
    });

    it('should render @Input() label', () => {
      expect(component.label).toBeFalsy('by default');
      expect(fixture.debugElement.query(By.css(labelSelector))).toBeFalsy();

      const label: string = '[test-component-label-text]';
      component.label = label;
      fixture.detectChanges();
      const labelElement: DebugElement = fixture.debugElement.query(By.css(labelSelector));
      expect(labelElement).toBeTruthy();
      expect((labelElement.nativeElement as HTMLElement).textContent).toBe(label);

      component.label = null;
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css(labelSelector))).toBeFalsy();
    });

    it('should provide @Input() multiple flag', () => {
      expect(component.multiple).toBe(false, 'by default');

      let wrapper: DebugElement;

      wrapper = fixture.debugElement.query(By.css(toggleButtonGroupSelector));
      expect(wrapper.attributes['ng-reflect-multiple']).toBe('false');

      component.multiple = true;
      fixture.detectChanges();
      expect(wrapper.attributes['ng-reflect-multiple']).toBe('true');

      component.multiple = false;
      fixture.detectChanges();
      expect(wrapper.attributes['ng-reflect-multiple']).toBe('false');
    });

    it('should render provided buttons with settings', () => {
      const buttons: ButtonToggleInterface[] = [
        {
          disabled: false,
          icon: '[test-button1-icon]',
          iconSize: 111,
          text: '[test-button1-text]',
        },
        {
          disabled: true,
          icon: '[test-button2-icon]',
          iconSize: 222,
          text: '[test-button2-text]',
        }
      ];
      component.buttons = buttons;
      fixture.detectChanges();

      const renderedButtons: DebugElement[] = fixture.debugElement.queryAll(By.css('mat-button-toggle'));
      expect(renderedButtons.length).toBe(buttons.length);

      const [firstButton, secondButton]: DebugElement[] = renderedButtons;
      expect((firstButton.nativeElement as HTMLElement).textContent).toContain(buttons[0].text);
      expect((secondButton.nativeElement as HTMLElement).textContent).toContain(buttons[1].text);
      expect((firstButton.query(By.css('button')).nativeElement as HTMLButtonElement).disabled).toBe(false);
      expect((secondButton.query(By.css('button')).nativeElement as HTMLButtonElement).disabled).toBe(true);

      const firstButtonIcon: DebugElement = firstButton.query(By.css(`svg.icon-${buttons[0].iconSize}`));
      expect(firstButtonIcon).toBeTruthy();
      expect(firstButtonIcon.query(By.css('use')).attributes['xlink:href']).toBe(`#${buttons[0].icon}`);

      const secondButtonIcon: DebugElement = secondButton.query(By.css(`svg.icon-${buttons[1].iconSize}`));
      expect(secondButtonIcon).toBeTruthy();
      expect(secondButtonIcon.query(By.css('use')).attributes['xlink:href']).toBe(`#${buttons[1].icon}`);
    });

    it('should output selected button value with @Output("valueChange")', () => {
      const buttons: ButtonToggleInterface[] = [
        { value: '[test-1st-button-value]' },
        { value: '[test-2nd-button-value]' },
      ];
      component.buttons = buttons;
      fixture.detectChanges();

      let receivedValue: any;
      component.valueChange.subscribe(
        (val: ButtonToggleChangeEvent) => receivedValue = val.value,
        fail
      );

      const [firstButton, secondButton]: DebugElement[] = fixture.debugElement.queryAll(By.css('button'));

      (firstButton.nativeElement as HTMLButtonElement).click();
      expect(receivedValue).toBe(buttons[0].value);
      expect(component.formControl.value).toBe(buttons[0].value);

      (secondButton.nativeElement as HTMLButtonElement).click();
      expect(receivedValue).toBe(buttons[1].value);
      expect(component.formControl.value).toBe(buttons[1].value);
    });

    it('should highlight error state', () => {
      let nextErrorState: boolean;
      const errorStateMatcher: ErrorStateMatcherInterface = new ErrorStateMatcher();
      spyOn(errorStateMatcher, 'isErrorState').and.callFake(() => nextErrorState);
      component.errorStateMatcher = errorStateMatcher;

      nextErrorState = false;
      expect(component.isErrorState).toBe(nextErrorState, 'self-test');
      component.label = '[test-component-label-text]';
      fixture.detectChanges();
      expect((fixture.debugElement.query(By.css(labelSelector)).nativeElement as HTMLElement).classList)
        .not.toContain('text-danger');
      expect(fixture.debugElement.query(By.css(toggleGroupWithErrorSelector))).toBeFalsy();

      nextErrorState = true;
      expect(component.isErrorState).toBe(nextErrorState, 'self-test');
      fixture.detectChanges();
      expect((fixture.debugElement.query(By.css(labelSelector)).nativeElement as HTMLElement).classList)
        .not.toContain('text-danger');
      expect(fixture.debugElement.query(By.css(toggleGroupWithErrorSelector))).toBeTruthy();

      component.errorMessage = '[test-error-message]';
      fixture.detectChanges();
      expect((fixture.debugElement.query(By.css(labelSelector)).nativeElement as HTMLElement).classList)
        .toContain('text-danger');

      nextErrorState = false;
      expect(component.isErrorState).toBe(nextErrorState, 'self-test');
      fixture.detectChanges();
      expect((fixture.debugElement.query(By.css(labelSelector)).nativeElement as HTMLElement).classList)
        .not.toContain('text-danger');
      expect(fixture.debugElement.query(By.css(toggleGroupWithErrorSelector))).toBeFalsy();
    });
  });
});
