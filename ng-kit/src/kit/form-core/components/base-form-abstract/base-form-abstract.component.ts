import { AfterViewInit, OnDestroy, ChangeDetectorRef, Injector, Input, ViewChild, ElementRef, NgZone, Directive } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Subject, Observable, ReplaySubject, of, merge, Subscription, throwError } from 'rxjs';
import { takeUntil, map, switchMap, distinctUntilChanged, filter, take, catchError } from 'rxjs/operators';
import { cloneDeep, forEach, merge as lodashMerge } from 'lodash-es';
import { v4 as uuid } from 'uuid';
import { SessionStorageService } from 'ngx-webstorage';
import { flatten, unflatten } from 'flat';

import { AuthService } from '../../../auth';
import { BackendLoggerService } from '../../../backend-logger/src/services';
import { EnvironmentConfigService } from '../../../environment-config/src/services';

import { FORM_DATE_ADAPTER } from '../../constants';
import { ErrorBag, ErrorBagFlatData } from '../../services';
import { DateAdapterInterface } from '../../interfaces';
import { FormFieldEnum } from '../../types';
import { BaseFormScheme, BaseFormSchemeField, BaseFormSchemeFieldsets } from '../../interfaces/form-scheme.interface';

export type FormControlsType = { [key: string]: AbstractControl } | AbstractControl[];

export interface FormValues {
  [key: string]: any;
}

const tokenStorageKey = 'pe-form-token';

@Directive()
export abstract class BaseFormAbstractComponent<T extends {}, FormSchemeField extends BaseFormSchemeField> implements AfterViewInit, OnDestroy {

  @Input('doSubmit$') set doSubmit$(doSubmit$: Subject<null | void>) {
    if (this.doSubmitSubscription) {
      this.doSubmitSubscription.unsubscribe();
    }

    this.doSubmitSubscription = doSubmit$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => this.doSubmit());
  }

  abstract get formScheme(): BaseFormScheme<FormSchemeField>;

  set form(form: FormGroup) {
    // TODO: is it necessary exactly here? Here is logic for createForm() only
    if (this.form && this.form !== form) {
      throw new Error('Form has been already created');
    }
    this.form$.next(form);
    this.afterFormCreate();
  }
  get form(): FormGroup {
    return this.form$.getValue();
  }

  get errors$(): Observable<ErrorBagFlatData> {
    if (!this.errorBag) {
      throw new Error('ErrorBag must be difined in child class');
    }
    return this.errorBag.errorsFlat$;
  }

  @ViewChild('submitTrigger') submitTriggerRef: ElementRef<HTMLElement>;

  formToken: string;
  paymentFlowId: string;
  isSubmitted: boolean = false;

  protected get initialData(): T {
    const storageData: T = this.getStorageData();
    return storageData ? storageData : <T>{};
  }

  protected allowScrollToError: boolean = true;
  protected changeDetectorRef: ChangeDetectorRef = this.injector.get(ChangeDetectorRef);
  protected dateAdapter: DateAdapterInterface = this.injector.get(FORM_DATE_ADAPTER);
  protected ngZone: NgZone = this.injector.get(NgZone);
  protected destroyed$: ReplaySubject<boolean> = new ReplaySubject();
  protected errorBag: ErrorBag;
  protected formBuilder: FormBuilder = this.injector.get(FormBuilder);
  protected formStorageKey: string;
  // WARNING: We will get a lot of problems with Session storage because many browsers clear it when we
  // redirect to anouther site (for example when NemidId login) and redirect back.
  protected storageService: SessionStorageService = this.injector.get(SessionStorageService);
  protected el: ElementRef<HTMLElement> = this.injector.get(ElementRef);
  protected errorElementName: string = 'mat-error';
  protected doSubmitSubscription: Subscription;

  private form$: BehaviorSubject<FormGroup> = new BehaviorSubject(null);

  constructor(
    protected injector: Injector
  ) {}

  ngAfterViewInit(): void {
    this.initFormToken();
    this.createForm(this.initialData);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  initFormToken(): void {
    const data = this.getStorageData() || ({} as any);
    this.formToken = data[tokenStorageKey];
    if (!this.formToken) {
      this.formToken = uuid();
      data[tokenStorageKey] = this.formToken;
      this.setStorageData(data);
    }
    if (this.checkFormHasIframeInputs() && !this.paymentFlowId) {
      console.warn('Form that has iframe inputs should also have flowId!');
    }
  }

  afterFormCreate(): void {
    this.form.valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.onUpdateFormData(this.getFormValuesFormatted(false));
      });

    this.onUpdateFormData(this.getFormValuesFormatted(false));
    this.forceRerenderAllFieldsets();
  }

  doSubmit(): void {
    if (this.submitTriggerRef) {
      this.dispatchClickEventOnSubmitRef();
    } else {
      throw new Error('Attempt to trigger submit without reference to native trigger element. Make sure #submitTrigger is present in your template.');
    }
  }

  onSubmit(): void {
    if (this.form) {
      this.markFormGroupTouched(this.form.controls);
      this.isSubmitted = true;
      this.changeDetectorRef.detectChanges();
      if (this.form.valid) {
        this.saveDataToStorage();
        this.onSuccess();
      } else {
        this.onFormInvalid();
      }
    } else {
      throw new Error('Cannot submit form because its not provided yet');
    }
  }

  prepareFormTokenData(values: T): Observable<void> {
    if (!this.formToken) {
      console.error('Form token is not set!');
    } else if (!this.paymentFlowId) {
      console.error('Form paymentFlowId is not set!');
    } else {
      const configService: EnvironmentConfigService = this.injector.get(EnvironmentConfigService);
      const authService: AuthService = this.injector.get(AuthService);
      const httpClient: HttpClient = this.injector.get(HttpClient);
      const backendLoggerService: BackendLoggerService = this.injector.get(BackendLoggerService);
      const url = `${configService.getBackendConfig().paymentDataStorage}/api/storage/${this.formToken}/flow/${this.paymentFlowId}`;
      const token = authService.prefferedCheckoutToken;
      // TODO Maybe better to move to some service
      return httpClient.put<void>(url, values, { headers: {Authorization: `Bearer ${token}`}}).pipe(catchError(errors => {
        backendLoggerService.logError(`Not possible to safe form data by token! (${this.paymentFlowId})`);
        return throwError(errors);
      }));
    }
  }

  removeSchemeIframeInputsValues(values: T): T {
    const data = flatten(values);
    forEach(this.formScheme.fieldsets, (fieldsets, key) => {
      forEach(fieldsets, fs => {
        if (fs['type'] === FormFieldEnum.IframeInput || fs['type'] === FormFieldEnum.IframeInputIban) {
          delete data[`${key}.${fs.name}`];
        }
      });
    });
    return unflatten(data);
  }

  checkFormHasIframeInputs(): boolean {
    let result = false;
    if (this.formScheme && this.formScheme.fieldsets) {
      forEach(this.formScheme.fieldsets, fieldsets => {
        forEach(fieldsets, fs => {
          if (fs['type'] === FormFieldEnum.IframeInput || fs['type'] === FormFieldEnum.IframeInputIban) {
            result = true;
          }
        });
      });
    }
    return result;
  }

  fieldValue(key: string): any {
    return this.form.get(key) ? this.form.get(key).value : null;
  }

  fieldValueFormatted(key: string): any {
    const formatted: any = this.getFormValuesFormatted(false);
    return flatten(formatted)[key];
  }

  fieldValue$(key: string): Observable<any> {
    return this.form$.asObservable().pipe(
      filter(form => Boolean(form.get(key))),
      switchMap(form =>
        merge(
          of(form.get(key).value),
          form.get(key).valueChanges.pipe(
            distinctUntilChanged()
          )
        )
      )
    );
  }

  fieldActive$(key: string): Observable<boolean> {
    return this.form$.asObservable().pipe(
      filter(form => Boolean(form.get(key))),
      switchMap(form =>
        merge(
          of(form.get(key).status),
          form.get(key).statusChanges
        ).pipe(
          map((status: string) => status !== 'DISABLED'),
          distinctUntilChanged()
        )
      )
    );
  }

  protected setStorageData(data: T): void {
    if (this.formStorageKey === null) {
      // Sometimes we need to fully disable saving to storage for security purposes. For example at Login page.
      return;
    }
    if (!this.formStorageKey) {
      throw new Error('Can not save to storage because formStorageKey is not set in form class');
    }

    const oldData = this.getStorageData() || {};
    data[tokenStorageKey] = oldData[tokenStorageKey];

    this.storageService.store(this.formStorageKey, data);
  }

  protected mergeStorageData(data: T): void {
    this.setStorageData(lodashMerge(this.getStorageData(), data));
  }

  protected getStorageData(): T {
    return this.formStorageKey && this.storageService.retrieve(this.formStorageKey);
  }

  /**
   * Always emits formatted data values (dates as strings)
   */
  protected abstract onUpdateFormData(formValues: {}): void;

  /**
   * Called when validation is passed
   */
  protected abstract onSuccess(): void;

  /**
   * Define your reactive form here
   */
  protected abstract createForm(initialData: T): void;

  protected getFormValuesFormatted(onlyValid: boolean): T {
    const formValue: T = (this.form && this.form.value) ? cloneDeep(onlyValid ? this.getValidValues(this.form.controls) : this.form.value) : {};
    this.convertDatesToStrings(formValue);
    return formValue;
  }

  protected saveDataToStorage(): void {
    this.setStorageData(this.getFormValuesFormatted(false));
  }

  protected flushDataStorage(): void {
    this.storageService.clear(this.formStorageKey);
  }

  protected convertDatesToStrings(values: FormValues): void {
    forEach(values, (value, key) => {
      if (value instanceof Date) {
        values[key] = this.dateAdapter.format(value);
      } else if (value && typeof value === 'object') {
        this.convertDatesToStrings(value);
      }
    });
  }

  protected stringToDate(value: string | Date): Date {
    return value instanceof Date ? value : (value ? this.dateAdapter.parse(value) : null);
  }

  protected toggleControl(
    name: string,
    enable: boolean,
    emitEvent: boolean = false
  ): void {
    const control: AbstractControl = this.form && this.form.get(name);

    if (control) {
      if (enable && control.disabled) {
        control.enable({emitEvent});
      } else if (!enable && control.enabled) {
        control.disable({emitEvent});
      }
    }
  }

  protected enableControl(name: string): void {
    this.toggleControl(name, true);
  }

  protected disableControl(name: string): void {
    this.toggleControl(name, false);
  }

  /**
   * Sometimes we need to trigger rerender of *ngFor when field status is changed
   * inside form group but form renderer which renders array of formScheme fields
   * doesn't know about this changes.
   * @TODO think about deeper sync of formScheme and angular form groups.
   */
  protected forceRerenderFieldset(name: string): void {
    this.formScheme.fieldsets[name] = this.formScheme.fieldsets[name].slice();
  }

  protected forceRerenderAllFieldsets(): void {
    const fieldsets: BaseFormSchemeFieldsets<FormSchemeField> = this.formScheme && this.formScheme.fieldsets;
    if (fieldsets) {
      Object.keys(fieldsets)
        .forEach(name => this.forceRerenderFieldset(name));
    }
  }

  protected markFormGroupTouched(formControls: FormControlsType): void {
    Object.keys(formControls)
      .map(key => formControls[key])
      .forEach((control: AbstractControl) => {
        if (control instanceof FormGroup || control instanceof FormArray) {
          this.markFormGroupTouched(control.controls);
        } else if (control instanceof AbstractControl) {
          control.markAsTouched();
        }
      });
  }

  protected onFormInvalid(): void {
    this.scrollToError(this.el.nativeElement);
  }

  protected scrollToError(container: HTMLElement): void {
    if (this.allowScrollToError) {
      this.ngZone.onStable
        .pipe(
          takeUntil(this.destroyed$),
          take(1),
          map(() => container.querySelector(this.errorElementName)),
        )
        .subscribe(
          (errorEl: HTMLElement) => errorEl && errorEl.scrollIntoView() // TODO Add top offset
        );
    }
  }

  protected makeHiddenField(name: string): BaseFormSchemeField {
    const result: any = {  // TODO avoid any
      name,
      type: 'input',
      fieldSettings: {
        classList: 'hidden',
        label: ''
      },
      inputSettings: {
        placeholder: '',
      }
    };
    return result;
  }

  // Friendly method for IE11
  private dispatchClickEventOnSubmitRef(): void {
    let event: MouseEvent;

    try {
      event = new MouseEvent('click', { bubbles: true });
    } catch (_) {
      event = document.createEvent('MouseEvents');
      event.initEvent('click', true, true);
    }

    this.submitTriggerRef.nativeElement.dispatchEvent(event);
  }

  private getValidValues(controls: {[key: string]: AbstractControl | FormGroup}): any {
    const values: any = {};
    forEach(controls, (control: AbstractControl | FormGroup, key: string) => {
      if (control['controls']) {
        values[key] = this.getValidValues(control['controls']);
      } else if (control.valid) {
        values[key] = control.value;
      }
    });
    return values;
  }

}
