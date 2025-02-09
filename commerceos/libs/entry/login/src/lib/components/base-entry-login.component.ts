import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectorRef,
  Compiler,
  Directive,
  EventEmitter,
  Injector,
  Input,
  NgZone,
  OnChanges,
  OnInit,
  Output,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { BehaviorSubject, EMPTY, from, interval, Observable, of, zip } from 'rxjs';
import { catchError, filter, flatMap, map, mergeMap, switchMap, take, takeUntil, tap, withLatestFrom } from 'rxjs/operators';

import { ApiService } from '@pe/api';
import { LoginResponse, PeAuthService, SetTokensInterface } from '@pe/auth';
import { EnvironmentConfigInterface, PeDestroyService, PE_ENV } from '@pe/common';
import { BLOCK_EMAIL_REASONS, CAPTCHA_REASONS, LoginErrorReasons, LoginErrorsInterface } from '@pe/entry/shared';
import { retrieveLocale, TranslateService, TranslationLoaderService } from '@pe/i18n';
import { removeStyle } from '@pe/lazy-styles-loader';
import { loadEncryptionModule } from '@pe/shared/utils';
import { SnackbarService } from '@pe/snackbar';
import { LoadUser, PeUser, UserState } from '@pe/user';

import { AccountType } from '../enums';
import { LoginFormService } from '../login-form.service';

@Directive()
export abstract class BaseEntryLoginComponent implements OnChanges, OnInit {
  spinnerStrokeWidth = 2;
  spinnerDiameter = 18;
  @Input() withoutCreds: boolean;
  @Input() withoutRegister: boolean;
  @Input() username: string;
  @Input() withoutForgot: boolean;
  @Input() disableSocialLogin: boolean;
  @Input() disableSignUp: boolean;
  @Input() displayLoginWithEmail = true;
  @Input() employee: boolean;
  @Input() businessId: string;
  @Input() set isLoading(value: boolean) {
    this.isLoading$.next(value);
  }

  @Output() successLogin = new EventEmitter<LoginResponse | void>();
  @Output() secondFactorCode = new EventEmitter<LoginResponse | void>();
  @Output() register = new EventEmitter<void>();

  @Select(UserState.user) user$: Observable<PeUser>;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  loader = false;
  errorMessage = '';
  allowValidation = false;
  facebookUrl = '';
  googleUrl = '';

  formTranslationsScope = 'forms.login';

  errors = {
    email: {
      hasError: false,
      errorMessage: '',
    },
    plainPassword: {
      hasError: false,
      errorMessage: '',
    },
  };

  googleLoading = false;
  facebookLoading = false;

  form: FormGroup;

  abstract redirectSignUpUrl(): void;
  abstract navigateAfterSocialLogin(path: string): void;

  protected router = this.injector.get(Router)
  protected route = this.injector.get(ActivatedRoute);
  private authService = this.injector.get(PeAuthService);
  private translateService = this.injector.get(TranslateService);
  private snackbarService = this.injector.get(SnackbarService);
  private translationLoaderService = this.injector.get(TranslationLoaderService);
  private store = this.injector.get(Store);
  private cdr = this.injector.get(ChangeDetectorRef);
  private formBuilder = this.injector.get(FormBuilder);
  private loginFormService = this.injector.get(LoginFormService);
  private apiService = this.injector.get(ApiService);
  private compiler = this.injector.get(Compiler);
  private zone = this.injector.get(NgZone);
  private document: Document = this.injector.get(DOCUMENT);
  private env: EnvironmentConfigInterface = this.injector.get(PE_ENV);
  private readonly destroy$ = this.injector.get(PeDestroyService);

  constructor(
    protected injector: Injector,
  ) {
    removeStyle("pe-theme");
    this.form = this.formBuilder.group({
      email: [this.username || '', [Validators.email, Validators.required]],
      plainPassword: ['', [Validators.required, Validators.minLength(8)]],
    });

    this.form.valueChanges
      .pipe(
        tap(() => {
          this.allowValidation && this.checkErrors();
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();

    this.facebookUrl = `${this.env.backend.auth}/api/social/facebook/login`;
    this.googleUrl = `${this.env.backend.auth}/api/social/google/login`;
  }

  redirectGoogleUrl() {
    this.googleLoading = true;
    this.openPopup(this.googleUrl);
  }

  redirectFacebookUrl() {
    this.facebookLoading = true;
    this.openPopup(this.facebookUrl);
  }

  private openPopup(url: string): void {
    (window as any).peClosePopUpOfSocial = (token$: Observable<SetTokensInterface>) => {
      if (popupWindow) {
        popupWindow.close();
        popupWindow = null;
      }
      token$
        .pipe(
          switchMap((data) => {
            const { accessToken, refreshToken, error } = data;

            if (!accessToken && refreshToken) {
              this.router.navigate([`/second-factor-code`]);

              return of();
            }

            if (error || !accessToken || !refreshToken) {
              const errorMsg = `forms.login.error_reasons.${error ?? 'UNEXPECTED_ERROR'}`;
              this.zone.run(() => {
                this.snackbarService.toggle(true, {
                  content:
                    this.translateService.translate(errorMsg),
                  duration: 3500,
                  iconColor: 'red',
                  iconId: 'icon-alert-24',
                  iconSize: 24,
                });
              });
              this.googleLoading = false;
              this.facebookLoading = false;
              this.cdr.detectChanges();
            }

            if (!accessToken) {
              return of();
            }

            return zip(
              of(data),
              this.authService.setTokens({ accessToken, refreshToken }),
            );
          }),
          switchMap(([{ register }]) => {
            const personalPath = `/personal/${this.authService.getUserData().uuid}/info/overview`;

            if (register === true) {
              return this.apiService
                .createUserAccount({
                  hasUnfinishedBusinessRegistration: false,
                  registrationOrigin: {
                    url: this.document.URL,
                    account: AccountType.personal,
                  },
                })
                .pipe(map(() => personalPath));
            } else {
              this.activateAccountLang().toPromise();

              return this.loginFormService.getUserBusiness().pipe(
                map((businessData) => {
                  if (businessData.businesses.length === 1) {
                    return `/business/${businessData.businesses[0]._id}/info/overview`
                  }
                  if (businessData.businesses.length > 1) {
                    return 'switcher'
                  }

                  return personalPath;
                }));
            }
          }),
          tap((path) => {
            this.navigateAfterSocialLogin(path);
          }),
          takeUntil(this.destroy$),
        ).subscribe();
    };

    const popupWindowConfig = (): string => {
      const winWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      const winHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
      const width = winWidth / 1.5;
      const height = winHeight - 40;
      const left = (winWidth - width) / 1.5;
      const top = (winHeight - height) / 1.1;

      return `width=${width},height=${height},left=${left},top=${top}`;
    };

    let popupWindow = window.open(url, '_blank', popupWindowConfig());

    if (popupWindow) {
      popupWindow.focus();
      const subscription = interval(1000)
        .pipe(
          filter(() => popupWindow?.closed),
          tap(() => {
            this.facebookLoading = false;
            this.googleLoading = false;
            this.cdr.detectChanges();
            subscription.unsubscribe();
          }),
          takeUntil(this.destroy$))
        .subscribe();
    }
  }

  private checkErrors(): void {
    for (const control in this.form.controls) {
      const formControl = this.form.controls[control];
      const error = this.errors[control];

      if (formControl.invalid && error) {
        this.isLoading$.next(false);
        error.hasError = true;
        const fieldName = control === 'plainPassword' ? 'password' : control;

        if (formControl.errors.required && ['email', 'plainPassword'].includes(control)) {
          const errorMessageKey = `forms.error.validator.${fieldName}.required`;
          error.errorMessage = this.translateService.translate(errorMessageKey);
        }

        if (formControl.errors.minlength) {
          error.errorMessage = this.translateService.translate(
            `forms.error.validator.${fieldName}.minlength`,
          );
        }
      } else if (error) {
        error.hasError = false;
      }
    }
  }

  ngOnChanges(): void {
    this.username && this.form.get('email').setValue(this.username);
  }

  ngOnInit(): void {
    this.route.fragment
      .pipe(
        filter((fragment: string) => fragment === 'social'),
        tap(() => {
          this.displayLoginWithEmail = false;
        }),
        takeUntil(this.destroy$))
      .subscribe();
  }

  onLoginClick(e): void {
    e.preventDefault();
    if (this.withoutCreds) {
      this.activateAccountLang()
        .pipe(
          tap(() => {
            this.successLogin.emit();
          }),
          takeUntil(this.destroy$),
        ).subscribe();
    } else {
      this.onSuccess();
    }
  }

  onReCaptchaVerified(token: string | false): void {
    this.form.get('recaptchaToken').setValue(token || '');
    this.cdr.detectChanges();
  }

  navigateToPassword(): void {
    this.router.navigate(['/password']);
  }

  private activateAccountLang(): Observable<boolean> {
    return this.store.dispatch(new LoadUser()).pipe(
      withLatestFrom(this.user$),
      map(([_, user]) => user),
      filter(user => user?._id !== null),
      take(1),
      flatMap(user => user?.language && retrieveLocale() !== user.language
        ? this.translationLoaderService.reloadTranslations(user.language).pipe(map(() => true))
        : of(true),
      ),
    );
  }

  private onSuccess(): void {
    this.allowValidation = true;
    this.checkErrors();

    if (this.form.invalid) {
      return;
    }

    this.isLoading$.next(true);
    this.errorMessage = '';
    from(loadEncryptionModule(this.compiler, this.injector)).pipe(
      switchMap(encryptionService =>
        from(encryptionService.encryptPassWithPubKey(this.form.value.plainPassword)).pipe(
          mergeMap((encryptedPassword: string) => {
            const formData = { ...this.form.value };
            delete formData.plainPassword;
            const payload = {
              ...formData,
              encryptedPassword,
            };

            const auth$ = this.employee
              ? this.authService.loginEmployeeInBusiness(payload, this.businessId).pipe(map(res => ({
                accessToken: res.accessToken,
                loginResponse: res,
              })))
              : this.authService.login(payload).pipe(map(accessToken => ({ accessToken })));

            return auth$.pipe(
              tap(() => this.onUpdateFormData()),
              map(({ accessToken, loginResponse }: { accessToken: string, loginResponse?: LoginResponse }) => {
                !accessToken && this.secondFactorCode.emit(loginResponse);

                return { accessToken, loginResponse };
              }),
              filter(({ accessToken }) => !!accessToken),
              mergeMap(({ accessToken, loginResponse }) => this.activateAccountLang().pipe(
                tap(() => this.successLogin.emit(loginResponse)),
              )),
            );
          }),
        ),
      ),
      catchError(this.handleErrorMessage.bind(this)),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  private handleErrorMessage(errors: LoginErrorsInterface) {
    this.isLoading$.next(false);
    this.onUpdateFormData();

    if (CAPTCHA_REASONS.indexOf(errors.raw?.reason) >= 0) {
      this.form.addControl('recaptchaToken', new FormControl('', [Validators.required]));
    }

    if (!this.loginErrorMessage(errors)) {
      for (let field in errors.errorBag) {
        if (this.errors[field]) {
          this.errors[field].hasError = true;
          this.errors[field].errorMessage = this.translateService.translate(
            'forms.error.validator.password.minlength',
          );
        }
      }
    }
    this.cdr.detectChanges();

    return EMPTY;
  }

  private loginErrorMessage(errors: LoginErrorsInterface): boolean {
    let reason = errors?.raw?.reason;
    if (['Password session is expired', 'Expired Password'].includes(errors.message)) {
      reason = LoginErrorReasons.ExpiredPassword;
    }

    if (BLOCK_EMAIL_REASONS.includes(reason) ||
      CAPTCHA_REASONS.includes(reason) ||
      LoginErrorReasons.ExpiredPassword === reason
    ) {
      this.errorMessage = this.translateService.translate(`forms.login.error_reasons.` + reason);
    } else if (!errors.errorBag || Object.keys(errors.errorBag).length === 0) {
      this.errorMessage = errors.message || this.translateService.translate('forms.error.unknown_error');
    }

    return !!this.errorMessage;
  }

  navigate(page): void {
    const { invitationRedirectUrl } = this.route.snapshot.queryParams;
    const queryParams = invitationRedirectUrl ? { queryParams: { invitationRedirectUrl } } : undefined;
    this.router.navigate([page], queryParams);
  }

  protected onUpdateFormData(): void {
    this.form.removeControl('recaptchaToken');
    this.cdr.detectChanges();
  }

  checkEmail(blurred): void {
    const field = 'email';

    if (!this.allowValidation && this.errors[field]) {
      const form = this.form.get(field);
      if (form.errors?.email && blurred) {
        this.errors[field].hasError = true;
        this.errors[field].errorMessage = this.translateService.translate('forms.error.validator.email.invalid');

        return;
      }
      this.errors[field].hasError = false;
    }
  }

  showLogin(): void {
    this.displayLoginWithEmail = true;
  }
}
