import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, EMPTY, of } from 'rxjs';
import { catchError, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { AuthTokenPayload, PeAuthService } from '@pe/auth';
import { CosEnvService, LoaderService } from '@pe/base';
import { BusinessApiService } from '@pe/business';
import { PeDestroyService } from '@pe/common';
import { LoginFormService } from '@pe/entry/login';
import { CAPTCHA_REASONS, LoginErrorsInterface } from '@pe/entry/shared';
import { TranslateService } from '@pe/i18n';
import { PlatformService } from '@pe/platform';

@Component({
  selector: 'login-security-question',
  templateUrl: './login-security-question.component.html',
  styleUrls: ['./login-security-question.component.scss'],
  providers: [PeDestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginSecurityQuestionComponent implements OnInit, OnDestroy {
  returnUrl: string;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  securityQuestion$ = this.authService.userSecurityQuestion().pipe(
    map(resp => this.translateService.translate(resp?.question)),
    catchError(() => of('')),
  );

  secretForm: FormGroup;
  errorMessage = '';

  protected formStorageKey: string = null;

  get answer(): string {
    return this.secretForm.get('answer')?.value;
  }

  constructor(
    private translateService: TranslateService,
    private activatedRoute: ActivatedRoute,
    private platformService: PlatformService,
    private authService: PeAuthService,
    private router: Router,
    private loaderService: LoaderService,
    private apiService: BusinessApiService,
    private loginFormService: LoginFormService,
    private envService: CosEnvService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private destroyed$: PeDestroyService,
  ) {
  }

  ngOnInit() {
    this.envService.secondFactorAuthPassed = true;
    const payload: AuthTokenPayload = this.authService.getRefershTokenData();
    this.platformService.profileMenuChanged = {
      firstName: payload.firstName,
      lastName: payload.lastName,
    };

    this.createForm();

    this.returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'];
    this.loaderService.hideLoader();
  }

  ngOnDestroy() {
    this.envService.secondFactorAuthPassed = true;
  }

  onSuccessLogin(): void {
    const { returnUrl, ...passQueryParams } = this.route.snapshot.queryParams;
    const queryParams = Object.keys(passQueryParams).length > 0 ? { queryParams: { ...passQueryParams } } : undefined;

    if (returnUrl) {
      const fullUrlRegexp = /^(http(s)?:\/\/.).*/;
      if (fullUrlRegexp.test(this.returnUrl)) {
        // use windows instead of router because we can authenticate from external sites
        window.location.replace(returnUrl);
      } else if (this.returnUrl.includes('second-factor-code')) {
        this.forkForNextSteepAfterIdentification(queryParams);
      } else {
        this.router.navigate([returnUrl], queryParams);
      }
    } else {
      this.forkForNextSteepAfterIdentification(queryParams);
    }
  }

  enterToDashboard(businesses) {
    const businessesId = businesses.businesses ? businesses.businesses[0]._id : businesses[0]._id;
    const invitationRedirectUrl = this.route.snapshot.queryParams.invitationRedirectUrl;
    if (invitationRedirectUrl) {
      this.router.navigate([invitationRedirectUrl, businessesId]);
    } else {
      const url = `business/${businessesId}/info/overview`;
      this.router.navigate([url]);
    }
  }

  forkForNextSteepAfterIdentification(queryParams) {
    this.apiService.getBusinessesList().pipe(
      switchMap((businesses) => {
        if (!businesses?.total) {
          return this.loginFormService.getUserBusiness().pipe(
            tap((businessData) => {
              if (businessData.businesses.length) {
                this.enterToDashboard(businessData.businesses);
              } else {
                this.router.navigate([`/personal/${this.authService.getUserData().uuid}`], queryParams);
              }
            }),
          );
        }

        if (businesses.total === 1) {
          this.enterToDashboard(businesses);

          return EMPTY;
        }

        this.router.navigate(['switcher'], queryParams);

        return EMPTY;
      }),
    ).subscribe();
  }

  onReCaptchaVerified(token: string | false): void {
    this.secretForm.get('recaptchaToken').setValue(token || '');
    this.cdr.detectChanges();
  }

  onCancel(): void {
    !this.isLoading$.value && this.router.navigate(['/second-factor-code']);
  }

  onSubmit(): void {
    this.secretForm.valid? this.onSuccess() : this.checkErrors();
  }

  checkErrors() {
    const recaptchaTokenControl = this.secretForm.get('recaptchaToken');
    if (recaptchaTokenControl
      && !recaptchaTokenControl.valid
      && recaptchaTokenControl.errors.required) {
        this.errorMessage = this.translateService.translate('forms.error.validator.recaptchaToken.required');
    } else {
      this.errorMessage = '';
    }
  }

  protected createForm(): void {
    this.secretForm = new FormGroup({
      recaptchaToken: new FormControl('', Validators.required),
      answer: new FormControl('', Validators.required),
    });

    this.secretForm.valueChanges.pipe(
      tap(() => this.errorMessage = ''),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  protected onSuccess(): void {
    this.isLoading$.next(true);
    this.errorMessage = '';

    this.authService.validateSecurityQuestion(this.secretForm.value).subscribe(
      () => {
        this.isLoading$.next(false);
        this.authService.resetSecurityQuestionDefined();
        this.onSuccessLogin();
      },
      (err) => {
        this.isLoading$.next(false);
        this.prepareErrorMessage(err);
      },
    );
  }

  private prepareErrorMessage(errors: LoginErrorsInterface): void {
    const reason = errors?.raw?.reason;

    if (CAPTCHA_REASONS.includes(reason)) {
      this.errorMessage = this.translateService.translate(`forms.login.error_reasons.` + reason);
    } else {
      this.errorMessage = this.translateService.translate('forms.error.validator.answer.invalid');
    }

    this.cdr.detectChanges();
  }
}
