import { CommonModule } from '@angular/common';
import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ViewChild,
  inject,
  OnDestroy,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormControl, FormGroupDirective, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { BehaviorSubject, merge, of, Subject, timer } from 'rxjs';
import { catchError, exhaustMap, filter, map, shareReplay, switchMap, takeUntil, tap } from 'rxjs/operators';

import { CheckoutFormsCoreModule } from '@pe/checkout/forms';
import { CheckoutFormsInputModule } from '@pe/checkout/forms/input';
import { TopLocationService } from '@pe/checkout/location';
import { FlowInterface } from '@pe/checkout/types';
import { CheckoutUiButtonModule } from '@pe/checkout/ui/button';
import { ContinueButtonModule } from '@pe/checkout/ui/continue-button';
import { ProgressButtonContentModule } from '@pe/checkout/ui/progress-button-content';
import { CustomElementService } from '@pe/checkout/utils';
import { PeDestroyService } from '@pe/destroy';

import { AutofocusDirective } from './directives';
import { OtpService } from './services';

const RESEND_DEBOUNCE = 30_000;
const MOBILE_BREAKPOINT = 768;

@Component({
  selector: 'pe-otp-container',
  templateUrl: './otp-container.component.html',
  styleUrls: ['./otp-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CheckoutFormsCoreModule,
    CheckoutFormsInputModule,
    ContinueButtonModule,
    CheckoutUiButtonModule,
    ProgressButtonContentModule,
    AutofocusDirective,
    MatCheckboxModule,
    MatDialogModule,
  ],
  providers: [
    OtpService,
    PeDestroyService,
  ],
})
export class OtpContainerComponent implements OnInit, OnDestroy {

  protected readonly customElementService = inject(CustomElementService);
  private readonly fb = inject(FormBuilder);
  private readonly topLocationService = inject(TopLocationService);
  private readonly otpService = inject(OtpService);
  private readonly destroy$ = inject(PeDestroyService);

  @ViewChild(FormGroupDirective) private formGroupDirective: FormGroupDirective;

  @Input() codeLength = 4;

  @Input() phoneNumber: string;

  @Input() set status(value: any) {
    value && this.loadingSubject$.next(value);
  }

  @Input() flow: FlowInterface;

  @Input() paymentId: string;

  @Input() consents: { documentId: string; label: string }[];

  @Input() showConsent = true;

  @Input() autoSubmit: boolean;

  @Output() codeReady = new EventEmitter<{
    otpCode: string;
    documentId: string;
    value: boolean;
  }>();

  @Output() closed = new EventEmitter<void>();

  protected readonly formArray = this.fb.array<FormControl<any>>([]);
  protected readonly consentsForm = this.fb.array([]);
  protected readonly formGroup = this.fb.group({
    code: this.formArray,
    consentsForm: this.consentsForm,
  });

  protected readonly activeIdx$ = this.formArray.valueChanges.pipe(
    map(values => values.filter(Boolean).length ?? 0),
  );

  protected translations: {
    [key: string]: string;
  };

  private readonly unloadListener = (event: BeforeUnloadEvent) => {
    event.preventDefault();
    event.returnValue = true;
  };

  private readonly loadingSubject$ = new BehaviorSubject<{ status: string, [key:string]: any }>(null);
  public readonly loading$ = merge(
    this.loadingSubject$.pipe(
      tap((value) => {
        !!value && window.removeEventListener('beforeunload', this.unloadListener);

        if (value?.status === 'error') {
          this.formArray.controls.forEach((control) => {
            control.setValue(null);
            control.setErrors({ invalid: true });
          });
          this.formGroupDirective.onSubmit(null);
        }
      }),
      map(value => value?.status === 'loading'),
    ),
    this.codeReady.pipe(
      tap(() => {
        window.addEventListener('beforeunload', this.unloadListener);
      }),
      map(() => true),
    ),
  );

  protected resendError: string;
  private readonly resendSubject$ = new Subject<void>();

  protected resend$ = merge(
    this.resendSubject$.pipe(
      map(() => true),
    ),
    this.resendSubject$.pipe(
      exhaustMap(() => this.otpService.resendOtpCode(this.flow, this.paymentId).pipe(
        map(() => false),
        catchError((error) => {
          this.resendError = error.message;

          return of(false);
        }),
      )),
    ),
  ).pipe(
    shareReplay(1),
  );

  protected resendBlock$ = merge(
    this.resend$.pipe(
      map(() => true),
    ),
    this.resend$.pipe(
      switchMap(() => timer(RESEND_DEBOUNCE).pipe(
        map(() => false),
      )),
    ),
  );

  protected get controls(): FormControl[] {
    return this.formArray.controls;
  }

  public get error() {
    return this.loadingSubject$.getValue()?.status === 'error'
      && this.loadingSubject$.getValue();
  }

  public get loading() {
    return this.loadingSubject$.getValue()?.status === 'loading';
  }

  public readonly numberMask = (value: string) => value
    ? value
      .replace(/[^a-zA-Z0-9]/g, '').slice(0, 1).toUpperCase()
    : value;

  ngOnInit(): void {
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons([
      'lock-16',
    ], null, this.customElementService.shadowRoot);

    for (let code = 0; code < this.codeLength; code++) {
      this.formArray.push(this.fb.control(null, Validators.required));
    }

    this.consents.forEach(() => {
      this.consentsForm.push(this.fb.control(null));
    });

    this.translations = {
      title: $localize`:@@ui.otp_container.title:`,
      subtitle: $localize`:@@ui.otp_container.subtitle:${this.codeLength}:count:`,
      infoText: $localize`:@@ui.otp_container.info_text:${this.phoneNumber}:text:`,
      retrySend: $localize`:@@ui.otp_container.retry_send:`,
      incorrectCode: window.innerWidth < MOBILE_BREAKPOINT
        ? $localize`:@@ui.otp_container.error.incorrect_code:`
        : $localize`:@@ui.otp_container.error.incorrect_code_one_line:`,
      consent: $localize`:@@ui.otp_container.consent:Consent`,
      resend: $localize `:@@ui.otp_container.resend:Resend code`,
      cancel: $localize`:@@ui.otp_container.cancel:Cancel`,
    };

    this.formGroup.valueChanges.pipe(
      filter(value => this.autoSubmit && value.code.length === this.codeLength && this.formGroup.valid),
      tap((value) => {
        if (this.autoSubmit
          && value?.code.length === this.codeLength
          && this.formGroup.valid
        ) {
          this.formGroupDirective.onSubmit(null);
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnDestroy(): void {
    window.removeEventListener('beforeunload', this.unloadListener);
  }

  public onSendCode() {
    this.formGroupDirective.onSubmit(null);
  }

  public onSubmit(): void {
    const { valid } = this.formArray;
    if (valid) {
      // TODO: remove this hack once we have proper models
      const values: string[] = Object.keys(this.formArray.value).map(key => this.formArray.value[key as any] || '');
      const otpCode = values.join('');

      this.codeReady.emit({
        otpCode,
        documentId: this.consents[0].documentId,
        value: !!this.consentsForm.get('0').value,
      });
    }
  }

  protected cancel(): void {
    this.topLocationService.href = this.flow.apiCall.cancelUrl;
  }

  protected resend(): void {
    this.resendSubject$.next();
  }
}
