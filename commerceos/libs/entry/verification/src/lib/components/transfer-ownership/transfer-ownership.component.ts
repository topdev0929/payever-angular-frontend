import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, EMPTY } from 'rxjs';
import { catchError, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PeAuthService } from '@pe/auth';
import { entryLogo } from '@pe/base';
import { BusinessTransferOwnershipService } from '@pe/business';
import { PeDestroyService } from '@pe/common';
import { LoginFormService } from '@pe/entry/login';
import { TranslateService } from '@pe/i18n-core';


interface TokenDataInterface {
  ownerId: string,
  newOwnerId: string,
  businessId: string,
}

enum ModeEnum {
  loading = 1,
  login = 2,
}

@Component({
  selector: 'entry-transfer-ownership',
  templateUrl: './transfer-ownership.component.html',
  styleUrls: ['./transfer-ownership.component.scss'],
})
export class TransferOwnershipComponent implements OnInit {
  entryLogo = entryLogo;

  public mode$: BehaviorSubject<ModeEnum> = new BehaviorSubject<ModeEnum>(ModeEnum.loading);

  public email: string;
  public errorText$ = new BehaviorSubject<string>(null);
  public isLoading = true;
  public userData;
  public businessData: any;
  public readonly ModeEnum = ModeEnum;

  public isLoading$ = this. errorText$.pipe(
    filter(d => !!d),
    map(data => !data)
  )

  private token: string;
  private tokenData: TokenDataInterface;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private loginFormService: LoginFormService,
    private businessTransferOwnershipService: BusinessTransferOwnershipService,
    private authService: PeAuthService,
    private translateService: TranslateService,
    private readonly destroyed$: PeDestroyService,
  ) {
  }

  ngOnInit() {
    const snapshot = this.activatedRoute.snapshot;

    this.token = snapshot.queryParamMap.get('token') || '';

    try {
      this.tokenData = JSON.parse(atob(this.token.split('.')[1]));
    } catch (e) {
      this.router.navigate(['login']);

      return;
    }

    this.mode$.next(ModeEnum.login);
  }

  isCurrentUserRecipient(): boolean {
    return this.authService.getUserData().uuid === this.tokenData.newOwnerId;
  }

  onSuccessLogin() {
    if (!this.isCurrentUserRecipient()) {
      this.errorText$.next(this.translateService.translate('forms.business_transfer_ownership.error_ownership'));

      return;
    }

    this.loginFormService.executeAfterLoginActions();
    localStorage.removeItem('pe_active_business');

    this.businessTransferOwnershipService.transferOwnership(this.token).pipe(
      switchMap(() => this.loginFormService.getUserBusiness().pipe(
        map((businessData) => {
          if (businessData.businesses.length === 1) {
            return `/business/${businessData.businesses[0]._id}/settings/general`
          } else if (businessData.businesses.length > 1) {
            return 'switcher';
          } else {
            return `personal/${this.tokenData.newOwnerId}/settings/general`;
          }
        })
      )),
      tap((path) => {
        this.router.navigate([path]);
      }),
      catchError((err) => {
        this.errorText$.next(this.translateService.translate(err.error.message));

        return EMPTY;
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  onSecondFactorCode(): void {
    localStorage.removeItem('pe_active_business');
    const queryParams = this.isCurrentUserRecipient()
      ? this.makeQueryParams({ returnUrl: `personal/${this.tokenData.newOwnerId}/settings/general` })
      : undefined;
    this.router.navigate(['second-factor-code'], queryParams);
  }

  makeQueryParams(returnUrl = {}) {
    return {
      queryParams: {
        ...returnUrl,
        transferOwnership: this.token,
      },
    };
  }
}
