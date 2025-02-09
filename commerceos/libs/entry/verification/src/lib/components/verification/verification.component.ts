import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, throwError } from 'rxjs';
import { mergeMap, catchError, takeUntil, tap } from 'rxjs/operators';

import { ApiService } from '@pe/api';
import { PeAuthService } from '@pe/auth';
import { entryLogo } from '@pe/base';
import { PeDestroyService } from '@pe/common';
import { LoginFormService } from '@pe/entry/login';
import { AccountType, CreatePersonalFormEvent, CreatePersonalFormEventType } from '@pe/entry/personal-form';
import { TranslateService } from '@pe/i18n';
import { RegistrationService } from '@pe/shared/registration';
import { SnackbarService } from '@pe/snackbar';

enum ModeEnum {
  loading = 1,
  login = 2,
  register = 3,
  none = 4
}

@Component({
  selector: 'entry-verification',
  templateUrl: './verification.component.html',
  styleUrls: ['./verification.component.scss'],
  providers: [
    PeDestroyService,
  ],
})
export class VerificationComponent implements OnInit {
  entryLogo = entryLogo;

  public mode$: BehaviorSubject<ModeEnum> = new BehaviorSubject<ModeEnum>(ModeEnum.loading);

  public email: string;
  public firstName: string;
  public lastName: string;
  public errorText: string = null;
  public isLoading = true;
  public userData;
  public businessData: any;
  public tokenData: {id: string, businessId: string, email: string};

  public readonly ModeEnum = ModeEnum;
  private token: string;


  constructor(
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private router: Router,
    private loginFormService: LoginFormService,
    private registrationService: RegistrationService,
    private authService: PeAuthService,
    protected readonly destroy$: PeDestroyService,
    private translateService: TranslateService,
    private snackbarService: SnackbarService,
  ) {
  }

  ngOnInit() {
    const snapshot = this.activatedRoute.snapshot;

    this.token = snapshot.queryParamMap.get('token') || '';
    this.email = snapshot.queryParamMap.get('email') || '';
    this.firstName = this.replaceNullOrUndefined(snapshot.queryParamMap.get('firstName'));
    this.lastName = this.replaceNullOrUndefined(snapshot.queryParamMap.get('lastName'));

    try {
      this.tokenData = JSON.parse(atob(this.token.split('.')[1]));
    } catch (e) {
      this.router.navigate(['login']);

      return;
    }

    this.apiService.inviteDataEmployee(this.tokenData.businessId, this.tokenData.id).pipe(
      mergeMap(({ isRegistered, isVerifiedToBusiness }) => this.apiService.verifyEmployee(this.token).pipe(
        tap(() => {
          this.isLoading = false;
          if (isVerifiedToBusiness && isRegistered) {
            this.router.navigate(['login']);

            return;
          }
          this.mode$.next(isRegistered ? ModeEnum.login : ModeEnum.register);
        }),
        catchError((error) => {
          this.errorText = error.error?.message
            ? error.error.message
            : this.translateService.translate('forms.error.unknown_error');
          this.mode$.next(ModeEnum.none);

          return throwError(error);
        })
      )),
      catchError((err) => {
        this.errorText = this.translateService.translate('forms.error.token_expired');
        this.mode$.next(ModeEnum.none);

        return throwError(err);
      })
    ).subscribe();



    this.loginFormService.addAfterLoginActions(() => {
      if (!this.destroy$.isStopped) {
        this.apiService.confirmBusinessForEmployee(this.tokenData.businessId, this.tokenData.id).pipe(
          takeUntil(this.destroy$),
        ).subscribe(); // TODO Add error handler
      }
    });
  }

  onSuccessLogin() {
    this.loginFormService.executeAfterLoginActions();
    this.router.navigate([`business/${this.tokenData.businessId}/info/overview`]);
  }

  onSecondFactorCode(): void {
    const queryParams = { queryParams: { returnUrl: `business/${this.tokenData.businessId}/info/overview` } };
    this.router.navigate(['second-factor-code'], queryParams);
  }

  onFormEvent(e: CreatePersonalFormEvent): void {
    switch (e.event) {
      case CreatePersonalFormEventType.EmployeeIsCreated:
        this.router.navigate([`business/${e.data?.businessId}/info/overview`]);
        break;
      case CreatePersonalFormEventType.UserIsCreated:
        if (e.data === AccountType.personal) {
          this.router.navigate([`/personal/${this.authService.getUserData().uuid}`]);
        } else {
          this.registrationService.registrationStep$.next(2);
        }
        break;
      case CreatePersonalFormEventType.NavigateToLogin:
        this.router.navigate(['/login']);
        break;
    }
  }

  onFormError(errors: any): void {
    if (errors?.error?.errors[0].constraints) {
      const passwordNotPwnedMessage = errors?.error?.errors[0].constraints?.PasswordNotPwned;

      this.snackbarService.toggle(true, {
        content: this.translateService.translate(passwordNotPwnedMessage || 'forms.error.unknown_error'),
        duration: 15000,
        iconColor: 'red',
        iconId: 'icon-alert-24',
        iconSize: 24,
      });

      this.mode$.next(ModeEnum.login);
    }
  }

  private replaceNullOrUndefined(value: string): string {
    if (typeof value !== 'string') {
      return '';
    }

    return value.replace('null', '').replace('undefined', '').trim().length ? value : '';
  }
}
