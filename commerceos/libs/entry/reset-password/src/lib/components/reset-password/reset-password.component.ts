import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { mergeMap, take } from 'rxjs/operators';

import { ApiService } from '@pe/api';
import { entryLogo } from '@pe/base';
import { InputPasswordValidator } from '@pe/forms';
import { TranslateService } from '@pe/i18n';

interface IconInterface {
  icon: string;
  width?: number;
  height?: number;
}
@Component({
  selector: 'entry-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ResetPasswordComponent {
  success = false;
  form;
  isLoading = false;
  errorMessage = '';

  passwordFocused$ = new BehaviorSubject<boolean>(false);

  formTranslationsScope = 'forms.reset_password';

  protected formStorageKey: string = null;

  errors = {
    password: {
      hasError: false,
      errorMessage: '',
    },
    confirm_password: {
      hasError: false,
      errorMessage: '',
    },
  };

  constructor(
    private apiService: ApiService,
    private translateService: TranslateService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
  ) {
    this.form = this.formBuilder.group(
      {
        password: ['', [Validators.required, InputPasswordValidator.default]],
        confirm_password: ['', [Validators.required]],
      },
      {
        validators: validateConfirmPassword,
      },
    );
  }

  protected onPasswordInputFocus(): void {
    if (!this.passwordFocused$.value) {
      this.passwordFocused$.next(true);
    }
  }

  protected onSuccess(): void {
    if (this.form.invalid) {
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;
    this.route.params
      .pipe(
        take(1),
        mergeMap((params: Params) => {
          return this.apiService.resetPassword({ plainPassword: this.form.value.password }, params['token']);
        }),
      )
      .subscribe(
        () => {
          this.isLoading = false;
          this.success = true;
          this.cdr.detectChanges();
        },
        (err: any) => {
          this.onUpdateFormData();
          if (err.error && ['REASON_DISPLAY_CAPTCHA', 'REASON_NO_CAPTCHA'].indexOf(err.error.reason) >= 0) {
            this.form.addControl('recaptchaToken', new FormControl('', [Validators.required]));
          }
          this.isLoading = false;
          this.parseError(err);
          this.cdr.detectChanges();
        },
      );
  }

  onReCaptchaVerified(token: string | false): void {
    this.form.get('recaptchaToken').setValue(token || '');
    this.cdr.detectChanges();
  }

  getIndustryIcon(): IconInterface {
    const industry: string = this.route.snapshot?.params.industry;
    const icon = `#icon-industries-${industry}`;

    if (industry) {
      (window as any).PayeverStatic.IconLoader.loadIcons(['industries']);
    }

    return industry ? { icon, height: 30 } : entryLogo;
  }

  checkErrors(field) {
    const form = this.form.get(field);
    if (form.invalid && this.errors[field]) {
      this.errors[field].hasError = true;
      if (form.errors.required) {
        this.errors[field].errorMessage = this.translateService.translate('forms.error.validator.required');
      }

      if (this.form.controls[field].errors?.showLengthError) {
        this.errors[field].errorMessage = this.translateService.translate(
          'forms.error.validator.password.minlength',
        );

        return;
      }

      if (Object.values(this.form.controls[field].errors).some(error => error === true)) {
        this.errors[field].errorMessage = this.translateService.translate(`forms.error.validator.${field}.invalid`);
      }

      return;
    }
    if (this.form.invalid && field === 'confirm_password') {
      if (this.form.errors?.confirm_password) {
        this.errors.confirm_password.hasError = true;
        this.errors.confirm_password.errorMessage = this.translateService.translate('forms.error.validator.password.missmatch');
      }

      return;
    }

    if (this.errors[field]) {
      this.errors[field].hasError = false;
    }
  }

  navigateToEntry(): void {
    this.router.navigate(['/login']);
  }

  protected onUpdateFormData(): void {
    this.form.removeControl('recaptchaToken');
    this.cdr.detectChanges();
  }

  private parseError(err: any): void {
    if (typeof err?.error?.errors === 'string') {
      this.setError(err.error.errors);

      return;
    }

    const constraints = Object.values(err?.error?.errors[0]?.constraints);
    this.setError(String(constraints[0]));
  }

  private setError(error: string): void {
    this.errorMessage = this.translateService.hasTranslation(error)
      ? this.translateService.translate(error)
      : this.translateService.translate('forms.error.unknown_error');
  }
}

function validateConfirmPassword(formGroup: FormGroup) {
  const value = formGroup.value;
  if (value.password?.length > 0 && formGroup.get('password').valid) {
    return value.password === value.confirm_password ? null : { confirm_password: true };
  }

  return null;
}
