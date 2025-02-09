import {
  ChangeDetectionStrategy,

  Component,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { isUndefined, keys } from 'lodash-es';
import { takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { AccountType } from '@pe/entry/personal-form';

import { BaseRegistrationComponent } from './base-registration.component';
import { FrontendAppsEnum } from './enums';


@Component({
  selector: 'entry-registration',
  template: `
    <entry-personal-registration
      [entryLogo]="entryLogo"
      *ngIf="step !== 2"
      (goLogin)="gotToLogin()"
      (navigateAfterSocial)="navigateAfterSocial($event)"
    ></entry-personal-registration>
    <ng-template #entryBusiness></ng-template>
  `,
  providers: [
    PeDestroyService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistrationComponent extends BaseRegistrationComponent {
  @ViewChild('entryBusiness', { read: ViewContainerRef }) entryBusinessRef: ViewContainerRef;

  step: number;
  type = this.activatedRoute.snapshot.data.type;

  entryLogo: any;

  private readonly frontendAppsNotAllowed: string[] = [
    'Builder',
    'CheckoutWrapper',
    'Commerceos',
    'PosClient',
    'ShopsClient',
  ];

  init() {
    localStorage.setItem('redirect_uri', '');
    this.initEntryLogo();

    this.activatedRoute.params.pipe(
      tap((params) => {
        if (!isUndefined(params.app)) {
          let appNameIsValid = false;

          keys(FrontendAppsEnum)
            .filter(key => this.frontendAppsNotAllowed.indexOf(key) === -1)
            .map((key) => {
              if (!appNameIsValid && FrontendAppsEnum[key] === params.app) {
                appNameIsValid = true;
              }
            });

          if (!appNameIsValid) {
            this.router.navigate(['/registration/business']);
          }
        }
      }),
      takeUntil(this.destroyed$)
    ).subscribe();

    this.activatedRoute.queryParams.pipe(takeUntil(this.destroyed$)).subscribe((params) => {
      if (!isUndefined(params.redirect_uri)) {
        localStorage.setItem('redirect_uri', JSON.stringify(params.redirect_uri));
      }
    });

    this.registrationService.registrationStep$.pipe(
      tap((step) => {
        this.step = step;
        this.type === AccountType.business && step === 2 && this.lazyLoadEntryBusiness();
        this.changeDetectorRef.detectChanges();
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }
}
