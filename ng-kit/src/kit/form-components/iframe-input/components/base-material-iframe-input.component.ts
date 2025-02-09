import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  AfterViewInit, Component, ElementRef, Input, OnDestroy, Optional, Self, SecurityContext, HostListener, ViewChild, Injector, Directive
} from '@angular/core';
import { FormGroup, ControlValueAccessor, NgControl, FormControl, AbstractControl, Validators, ValidationErrors } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { MatFormFieldControl } from '@angular/material/form-field';
import { Subject } from 'rxjs';
import { v4 as uuid } from 'uuid';

import { AuthService } from '../../../auth/src/services/auth.service';
import { WindowEventsService } from '../../../window';
import { EnvironmentConfigService } from '../../../environment-config/src/services';
import { BackendLoggerService } from '../../../backend-logger';
import { FieldsetErrorStateMatcher } from '../../../form-core/classes';
import { InputType } from '../../../form-core/enums';

const EVENT_KEY = 'pe-iframe-input'; // TODO This is copypaste from static repo

enum EnvEnum { // TODO This is copypaste from static repo
  Test = 'test',
  Stage = 'stage',
  Live = 'live',
}

enum EventActionEnum { // TODO This is copypaste from static repo
  SetFocused = 'setFocused',
  SetDisabled = 'setDisabled',
  SetEnabled = 'setEnabled',
  SetRequired = 'setRequired',
  SetOptional = 'setOptional',
  SetConfig = 'setConfig',
}

enum PostMessageTypeEnum { // TODO This is copypaste from static repo
  Ready = 'ready',
  ValueChange = 'valueChange',
  FocusChange = 'focusChange',
  SavingValueStatusChange = 'savingValueStatusChange',
  CriticalError = 'criticalError',
}

interface PostMessageInterface { // TODO This is copypaste from static repo
  iframeId: string;
  eventKey: string;
  formToken: string;
  formKey: string;
  eventType: PostMessageTypeEnum;
  value: any;
  focused: boolean;
  savingValue: boolean;
  lastError: string;
  invalid: boolean;
  validationError: string;
}

@Directive()
export abstract class BaseMaterialIframeInputComponent implements ControlValueAccessor, MatFormFieldControl<string>, AfterViewInit, OnDestroy {

  static nextId = 0;

  @Input() formKey: string;
  @Input() formToken: string;
  @Input() paymentFlowId: string;

  @Input() type: InputType;

  stateChanges: Subject<void> = new Subject<void>();
  destroyed$: Subject<boolean> = new Subject();
  focused = false;
  id = `material-iframe-input-${BaseMaterialIframeInputComponent.nextId++}`;
  describedBy = '';
  onChange = (_: any) => {};
  onTouched = () => {};

  @Input() errorStateMatcher: FieldsetErrorStateMatcher;

  @Input()
  // Placeholder not used but we have to declare
  get placeholder(): string { return this._placeholder; }
  set placeholder(value: string) {
    this._placeholder = value;
    this.stateChanges.next();
  }
  // tslint:disable
  private _placeholder: string;

  @Input()
  get required(): boolean { return this._required; }
  set required(value: boolean) {
    this._required = coerceBooleanProperty(value);
    this.postMessage(value ? EventActionEnum.SetRequired : EventActionEnum.SetOptional);
    this.stateChanges.next();
  }
  // tslint:disable
  private _required = false;

  @Input()
  get disabled(): boolean { return this._disabled; }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
    this.postMessage(value ? EventActionEnum.SetDisabled : EventActionEnum.SetEnabled);
    this.stateChanges.next();
  }
  // tslint:disable
  private _disabled = false;

  @Input()
  get value(): string | null {
    return this.formControl ? this.formControl.value : null;
  }
  set value(value: string) {
    if (this.formControl) {
      this.onTouched();
      this.formControl.setValue(value);
      this.formControl.markAsTouched();
      this.stateChanges.next();
    }
  }

  @Input() formControl: FormControl;

  @ViewChild('iframe', { static: true }) iframeRef: ElementRef;

  protected iframeId: string = uuid();
  protected showErrorFixTriggered: boolean = false;

  protected authService: AuthService = this.injector.get(AuthService);
  protected windowEventsService: WindowEventsService = this.injector.get(WindowEventsService);
  protected configService: EnvironmentConfigService = this.injector.get(EnvironmentConfigService);
  protected backendLoggerService: BackendLoggerService = this.injector.get(BackendLoggerService);
  protected sanitizer: DomSanitizer = this.injector.get(DomSanitizer);

  protected customInvalid: boolean = null;
  protected customValidationError: string = null;

  protected customValidator = (control: AbstractControl): ValidationErrors | null => {
    return this.customInvalid ? {
      custom: this.customValidationError || 'ng_kit.forms.error.validator.pattern'
    } : null;
  };

  constructor(
    protected injector: Injector,
    protected elementRef: ElementRef<HTMLElement>,
    @Optional() @Self() public ngControl: NgControl) {
    if (this.ngControl !== null) {
      this.ngControl.valueAccessor = this;
    }
  }

  get empty() {
    return !(this.formControl && this.formControl.value);
  }

  get shouldLabelFloat() { return this.focused || !this.empty; }

  get errorState(): boolean {
    const errorState = this.errorStateMatcher && this.formControl && this.errorStateMatcher.isErrorState(this.formControl, null);
    if (errorState) {
      if (!this.showErrorFixTriggered) {
        // We have to use this hack to show erro message on top when field is not tocuhed but we submit
        this.showErrorFixTriggered = true;
        this.elementRef.nativeElement.click();
      }
    }
    return errorState;
  }

  ngAfterViewInit() {
    this.windowEventsService.message$(this.destroyed$).subscribe(event => this.onMessage(event));
    this.iframeRef.nativeElement.setAttribute('src', this.getIframeSrc());
    this.formControl.setValidators([this.customValidator, this.formControl.validator]);
  }

  ngOnDestroy() {
    this.stateChanges.complete();
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  abstract getConfig(): any;

  onMessage(messageData: any): void {
    const data: PostMessageInterface = messageData && messageData.data ? messageData.data : null;
    if (data && data.eventKey === EVENT_KEY && data.iframeId === this.iframeId) {
      if (data.focused && !this.focused) {
        this.onTouched();
      }
      if (data.eventType === PostMessageTypeEnum.ValueChange) {
        this.value = data.value || '';

        this.customInvalid = data.invalid;
        this.customValidationError = data.validationError;
      }
      if (data.eventType === PostMessageTypeEnum.FocusChange) {
        this.focused = !!data.focused;
      }
      if (data.eventType === PostMessageTypeEnum.SavingValueStatusChange) {
        this.setSaving(!!data.savingValue);
      }
      if (data.eventType === PostMessageTypeEnum.CriticalError) {
        alert(`Critical error appeared: ${data.lastError}`); // alert is not good but should never happen
        this.backendLoggerService.logError(data.lastError);
      }

      if (data.eventType === PostMessageTypeEnum.Ready) {
        this.postMessage(EventActionEnum.SetConfig, this.getConfig());
      }

      this.stateChanges.next();
    }
  }

  setDescribedByIds(ids: string[]) {
    this.describedBy = ids.join(' ');
  }

  onContainerClick(event: MouseEvent) {
    if (!this.disabled) {
      this.focused = true;
      this.iframeRef.nativeElement.click();
      this.postMessage(EventActionEnum.SetFocused);
    }
  }

  writeValue(value: string): void {
    if (this.value !== value) {
      this.value = value;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  _handleInput(): void {
    this.onChange(this.value);
  }

  postMessage(action: EventActionEnum, data: any = null): void {
    if (this.iframeRef && this.iframeRef.nativeElement && this.iframeRef.nativeElement.contentWindow) {
      this.iframeRef.nativeElement.contentWindow.postMessage({ formToken: this.formToken, formKey: this.formKey, iframeId: this.iframeId, action, data }, '*');
    }
  }

  setSaving(saving: boolean): void {
    // Fake control to make form invalid while saving to prevent submit
    const key = `invalidValueForIframeInputSaving_${this.formKey}`;
    if (saving) {
      const invalidControl: AbstractControl = new FormControl(
        '',
        {
          validators: [
            Validators.required
          ]
        }
      );
      (this.formControl.parent as FormGroup).addControl(key, invalidControl);
    } else {
      (this.formControl.parent as FormGroup).removeControl(key);
    }
  }

  abstract getIframeBaseSrc(): string;

  getIframeSrc(): string {
    const base = this.getIframeBaseSrc();
    const url: string = `${base}?formKey=${encodeURIComponent(this.formKey)}&formToken=${this.formToken}` +
      `&flowId=${encodeURIComponent(this.paymentFlowId)}&env=${this.getEnv()}` +
      `&iframeId=${encodeURIComponent(this.iframeId)}` +
      `&guestToken=${encodeURIComponent(this.authService.prefferedCheckoutToken || '')}`;

    return this.sanitizer.sanitize(SecurityContext.URL, url);
  }

  private getEnv(): EnvEnum {
    const env = this.configService.getConfigConfig().env;
    if (env === 'test') {
      return EnvEnum.Test;
    }
    if (env === 'stage') {
      return EnvEnum.Stage;
    }
    return EnvEnum.Live;
  }

  // this allows consumers to use <select disabled="">
  // tslint:disable
  static ngAcceptInputType_disabled: boolean | string | null | undefined;

  // this allows consumers to use <select required="">
  // tslint:disable
  static ngAcceptInputType_required: boolean | string | null | undefined;
}
