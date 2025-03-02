import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Compiler,
  Component,
  EventEmitter,
  Inject,
  Injector,
  Input,
  NgZone,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, from, interval, Observable, of, Subject, throwError, zip } from 'rxjs';
import { catchError, finalize, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { ApiService, PartnerService } from '@pe/api';
import { PeAuthService, SetTokensInterface } from '@pe/auth';
import { entryLogo } from '@pe/base';
import { EnvironmentConfigInterface, PE_ENV, PeDestroyService } from '@pe/common';
import { EmployeeRegisterService, TokenDataInterface } from '@pe/entry/shared';
import { EMAIL_VALIDATOR, ErrorBag, InputPasswordValidator } from '@pe/forms';
import { LocaleConstantsService } from '@pe/i18n';
import { LocaleService, TranslateService } from '@pe/i18n-core';
import { loadEncryptionModule } from '@pe/shared/utils';
import { SnackbarService } from '@pe/snackbar';

import { AccountType } from './enums/account-type';

const blockReasons = [
  'REASON_REGISTRATION_20_MINUTES_BAN',
  'REASON_REGISTRATION_3_HOURS_BAN',
  'REASON_REGISTRATION_PERMANENT_BAN',
  'REASON_REGISTRATION_WRONG_PASSWORD',
];

export enum CreatePersonalFormEventType {
  UserIsCreated = 'AccountIsCreated',
  EmployeeIsCreated = 'EmployeeIsCreated',
  NavigateToLogin = 'NavigateToLogin',
  NavigateAfterSocial = 'NavigateAfterSocial',
}

export interface CreatePersonalFormEvent<T = any> {
  event: CreatePersonalFormEventType,
  data?: T;
}

@Component({
  selector: 'entry-create-personal-form',
  templateUrl: './create-personal-form.component.html',
  styleUrls: ['./create-personal-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    ErrorBag,
    PeDestroyService,
  ],
})
export class CreatePersonalFormComponent implements OnInit {
  spinnerStrokeWidth = 2;
  spinnerDiameter = 18;
  @Input() type: string;
  @Input() email: string;
  @Input() firstName: string = '';
  @Input() lastName: string = '';
  @Input() tokenData: TokenDataInterface;
  @Input() employee: boolean;

  @Output() eventOn = new EventEmitter<CreatePersonalFormEvent>();
  @Output() errorOn = new EventEmitter<any>();

  form: FormGroup;

  businessData: any;
  errorBag$: Subject<any> = new Subject();
  errorMessage = '';
  allowValidation = false;
  isLoading = false;
  entryLogo = entryLogo;
  emailAnimated = true;
  partnerData: any;
  inviteToken: string;
  preventFreeSpacePattern = /^[^-\s].*/;

  passwordFocused$ = new BehaviorSubject<boolean>(false);

  errors = {
    email: {
      hasError: false,
      errorMessage: '',
      label: this.translateService.translate('forms.personal_create.email.placeholder'),
    },
    password: {
      hasError: false,
      errorMessage: '',
      label: this.translateService.translate('forms.login.plainPassword.placeholder'),
    },
    confirmPass: {
      hasError: false,
      errorMessage: this.translateService.translate('forms.error.validator.confirm_pass.invalid'),
      label: this.translateService.translate('forms.login.confirmPassword.label'),
    },
    lastName: {
      hasError: false,
      errorMessage: '',
      label: this.translateService.translate('forms.personal_create.lastName.placeholder'),
    },
    firstName: {
      hasError: false,
      errorMessage: '',
      label: this.translateService.translate('forms.personal_create.firstName.placeholder'),
    },
  };

  termsLink: string;
  privacyLink: string;
  facebookUrl = '';
  googleUrl = '';
  googleLoading = false;
  facebookLoading = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private employeeRegisterService: EmployeeRegisterService,
    private authService: PeAuthService,
    private formBuilder: FormBuilder,
    private localeConstantsService: LocaleConstantsService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    private partnerService: PartnerService,
    private localeService: LocaleService,
    @Inject(DOCUMENT) private document: Document,
    private snackbarService: SnackbarService,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private destroy$: PeDestroyService,
    private compiler: Compiler,
    private injector: Injector,
    private zone: NgZone,
  ) {
    (window as any)?.PayeverStatic?.SvgIconsLoader?.loadIcons([
      'social-facebook-12',
    ]);
    this.handleErrors = this.handleErrors.bind(this);
    this.form = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.pattern(this.preventFreeSpacePattern)]],
      lastName: ['', [Validators.required, Validators.pattern(this.preventFreeSpacePattern)]],
      email: ['', [Validators.required, this.emailValidator]],
      password: ['', [Validators.required, InputPasswordValidator.default]],
      confirmPass: [''],
    }, { validators: this.checkPasswords });

    this.form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      if (this.allowValidation) { this.checkErrors(); }
    });

    this.facebookUrl = `${this.env.backend.auth}/api/social/facebook/register`;
    this.googleUrl = `${this.env.backend.auth}/api/social/google/register`;

    this.localeService.currentLocale$
      .pipe(
        tap((locale) => {
          this.termsLink = locale.code === 'de' ? 'https://payever.de/agb' : 'https://getpayever.com/terms';
          this.privacyLink =
            locale.code === 'de' ? 'https://payever.de/about/privacy' : 'https://getpayever.com/about/privacy';
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  ngOnInit() {
    if (this.email) {
      this.emailAnimated = false;
      const control = this.form.controls.email;
      control.setValue(this.email);
      control.setValidators([this.emailCompareValidator(this.email)]);
    }

    this.firstName && this.form.controls.firstName.setValue(this.firstName);
    this.lastName && this.form.controls.lastName.setValue(this.lastName);

    this.activatedRoute.data.pipe(
      take(1),
      tap((response: any) => {
        if (response?.type) {
          this.type = response.type;
        }
      })
    ).subscribe();

    this.activatedRoute.queryParams.pipe(
      take(1),
      tap((response) => {
        this.inviteToken = response?.token || null;
      })
    ).subscribe();
  }

  redirectGoogleUrl() {
    this.googleLoading = true;
    this.openPopup(this.googleUrl);
  }

  redirectFacebookUrl() {
    this.facebookLoading = true;
    this.openPopup(this.facebookUrl);
  }

  emailCompareValidator(email: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      return control.value !== email ? { emailNotEqual: true } : null;
    };
  }

  onFormDataReceive(data: any, needNextStep: boolean = false): void {
    if (needNextStep) {
      this.registerPersonalAccount();
    }
  }

  emailValidator(control: AbstractControl): { [key: string]: boolean } | null {
    return !EMAIL_VALIDATOR(control.value) ? { email: true } : null;
  }

  checkErrors() {
    for (let control in this.form.controls) {
      if (this.form.controls[control].invalid) {
        this.errors[control].hasError = true;
        if (this.form.controls[control].errors.required) {
          this.errors[control].errorMessage = this.translateService.translate('forms.registration.errors.required', {
            fieldName: this.errors[control].label,
          });
        }
        if (this.form.controls[control].errors.pattern) {
          this.errors[control].errorMessage = this.translateService.translate(`forms.error.validator.${control}.invalid`);
        }
        if (this.form.controls[control].errors.email) {
          this.errors[control].errorMessage = this.translateService.translate('forms.error.validator.email.invalid');
        }
        if (this.form.controls[control].errors.emailNotEqual) {
          this.errors[control].errorMessage = this.translateService.translate('forms.error.validator.email.not_equal');
        }
        if (this.form.controls[control].errors.minlength) {
          this.errors[control].errorMessage = this.translateService.translate(
            'forms.error.validator.password.minlength',
          );
        }
      } else {
        this.errors[control].hasError = false;
      }
    }
  }

  registerPersonalAccount(): void {
    this.partnerData = this.partnerService.getPartnerFromLocalStorage();
    this.allowValidation = true;
    this.checkErrors();

    if (this.form.get('password').value !== this.form.get('confirmPass').value) {
      this.form.get('confirmPass').setErrors({ notSame: true });
      this.checkErrors();
      this.cdr.detectChanges();

      return;
    }

    if (this.form.invalid) { return; }
    this.isLoading = true;
    from(loadEncryptionModule(this.compiler, this.injector))
      .pipe(
        switchMap(encryptionService =>
          from(encryptionService.encryptPassWithPubKey(this.form.value.password)).pipe(
            switchMap((encryptedPassword: string) => {
              const payload = {
                email: this.form.value.email,
                first_name: this.form.value.firstName,
                last_name: this.form.value.lastName,
                password: encryptedPassword,
                inviteToken: this.inviteToken,
                language: this.localeConstantsService.getLang(),
              };

              return this.employee
                ? this.employeeRegisterService.registerEmployee(
                  this.tokenData,
                  this.inviteToken,
                  payload,
                  this.form.value,
                ).pipe(tap(data => this.eventOn.emit({
                  event: CreatePersonalFormEventType.EmployeeIsCreated,
                  data,
                })))
                : this.authService.register(payload).pipe(switchMap(() => this.createUserAccount()));
            }),
          )),
        catchError((error, data) => {
          this.handleErrors(error);

          return throwError(error);
        }),
      ).pipe(
        finalize(() => this.isLoading = false),
        takeUntil(this.destroy$),
      ).subscribe();
  }

  private createUserAccount() {
    return this.apiService
      .createUserAccount({
        hasUnfinishedBusinessRegistration: this.type === AccountType.business,
        registrationOrigin: {
          url: this.document.URL,
          account: this.type === AccountType.personal ? AccountType.personal : AccountType.merchant,
          source: this.partnerData?.name,
        },
        language: this.localeConstantsService.getLang(),
      })
      .pipe(
        tap({
          next: (data) => {
            this.eventOn.emit({
              event: CreatePersonalFormEventType.UserIsCreated, data: {
                type: this.type,
                userId: data._id,
              },
            });
          },
          error: this.handleErrors,
        }),
      );
  }

  private handleErrors(errors: any) {
    this.errorOn.emit(errors);
    this.isLoading = false;

    if (errors.raw && ['REASON_DISPLAY_CAPTCHA', 'REASON_NO_CAPTCHA'].indexOf(errors.raw.reason) >= 0) {
      this.form.addControl('recaptchaToken', new FormControl('', [Validators.required]));
    }
    if (errors.raw && errors.raw.statusCode === 400) {
      for (let err in errors.errorBag) {
        if (this.errors[err]) {
          this.errors[err].errorMessage = errors.errorBag[err];
          this.errors[err].hasError = true;
        }
      }
    }

    if (
      errors.raw && errors.raw.statusCode === 401
    ) {
      this.errorMessage = errors.raw.message;
    }

    if (
      errors.raw?.reason && blockReasons.indexOf(errors.raw.reason) >= 0 ||
      !errors.errorBag ||
      Object.keys(errors.errorBag).length === 0
    ) {
      this.errorMessage = errors.raw?.reason
        ? this.translateService.translate(`forms.login.error_reasons.${errors.raw.reason}`)
        : errors.message || 'Unknown error';
    }

    if (
      errors.raw &&
      ['REASON_EMAIL_BAN_LOGIN', 'REASON_EMAIL_BAN_REGISTER'].indexOf(errors.raw.message) >= 0
    ) {
      this.errorMessage = this.translateService.translate(`forms.login.error_reasons.${errors.raw.message}`);
    }
    this.cdr.detectChanges();
  }

  onReCaptchaVerified(token: string | false): void {
    this.form.get('recaptchaToken').setValue(token || '');
    this.cdr.detectChanges();
  }

  checkField(field, blured) {
    if (field === 'password') {
      this.passwordFocused$.next(!blured);
    }

    if (!this.allowValidation) {
      const form = this.form.get(field);

      if (form.errors?.pattern && blured) {
        this.errors[field].hasError = true;
        this.errors[field].errorMessage = this.translateService.translate(`forms.error.validator.${field}.invalid`);

        return true;
      }

      if (form.errors?.email && blured) {
        this.errors[field].hasError = true;
        this.errors[field].errorMessage = this.translateService.translate('forms.error.validator.email.invalid');

        return true;
      }
      if (field === 'password' && form.errors && blured && !form.errors.required) {
        this.errors[field].hasError = true;
        this.errors[field].errorMessage = this.translateService.translate('forms.error.validator.password.invalid');

        return true;
      }

      this.errors[field].hasError = false;
    }
  }

  checkPasswords: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    if (group.get('confirmPass').value) {
      const passControl = group.get('password');
      const confirmPassControl = group.get('confirmPass');
      if (passControl.value) {
        if (passControl.value === confirmPassControl.value) {
          this.errors.confirmPass.hasError = false;

          return null;
        }

        this.errors.confirmPass.hasError = true;
        confirmPassControl.setErrors({ notSame: true });

        return { notSame: true };
      }
    }

    return null;
  }

  scrollTo(el: HTMLElement) {
    el.scrollIntoView();
  }

  navigate(): void {
    this.eventOn.emit({ event: CreatePersonalFormEventType.NavigateToLogin });
  }

  openPopup(url: string) {
    const winWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    const winHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    const width = winWidth / 1.5;
    const height = winHeight - 40;
    let opened = window.open(
      url,
      '_blank',
      `width=${width},height=${height},left=${(winWidth - width) / 1.5},top=${(winHeight - height) / 1.1}`,
    );

    if (opened) {
      opened.focus();
      const subscription = interval(1000).pipe(
        tap(() => {
          if (opened?.closed) {
            this.facebookLoading = false;
            this.googleLoading = false;
            this.cdr.detectChanges();
            subscription.unsubscribe();
          }
        },
        )).subscribe();
    }

    (window as any).peClosePopUpOfSocial = (token$: Observable<SetTokensInterface>) => {
      if (opened) {
        opened.close();
        opened = null;
        this.facebookLoading = false;
        this.googleLoading = false;
        this.cdr.detectChanges();
      }
      token$.pipe(
        switchMap((data) => {

          const { accessToken, refreshToken, error } = data;
          if (error) {
            this.zone.run(() => {
              this.snackbarService.toggle(true, {
                content: this.translateService.translate(`forms.login.error_reasons.${error}`),
                duration: 3500,
                iconColor: 'red',
                iconId: 'icon-alert-24',
                iconSize: 24,
              });
            });
          }

          if (!accessToken) {

            return of();
          }

          return zip(
            of(data),
            this.authService.setTokens({
              accessToken,
              refreshToken,
            }),
          );
        }),
        switchMap(([data]) => {
          const { register } = data;
          if (register === 'true') {

            return this.apiService
              .createUserAccount({
                hasUnfinishedBusinessRegistration: this.type === AccountType.business,
                registrationOrigin: {
                  url: this.document.URL,
                  account: AccountType.business,
                },
              })
              .pipe(
                tap(() => {
                  this.eventOn.emit({
                    event: CreatePersonalFormEventType.NavigateAfterSocial, data: {
                      type: this.type,
                    },
                  });
                })
              );
          } else {
            this.zone.run(() => {
              this.snackbarService.toggle(true, {
                content: this.translateService.translate('forms.error.validator.content'),
                duration: 3500,
                iconColor: 'red',
                iconId: 'icon-alert-24',
                iconSize: 24,
              });
            });

            return;
          }
        }),
      ).subscribe();
    };
  }
}
