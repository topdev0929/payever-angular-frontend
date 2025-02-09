import {
  ChangeDetectionStrategy,

  Component,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { takeUntil, tap } from 'rxjs/operators';

import { entryLogo } from '@pe/base';
import { PeDestroyService } from '@pe/common';
import { AccountType } from '@pe/entry/personal-form';
import { OnboardingUtilsService } from '@pe/shared/onboarding';

import { BaseRegistrationComponent } from './base-registration.component';


@Component({
  selector: 'entry-plugin-onboarding',
  template: `
    <entry-personal-registration
      [hideLogo]="false"
      *ngIf="step !== 2"
      (goLogin)="gotToLogin()"
      (navigateAfterSocial)="navigateAfterSocial()"
    ></entry-personal-registration>
    <ng-template #entryBusiness></ng-template>
  `,
  providers: [
    PeDestroyService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PluginOnboardingComponent extends BaseRegistrationComponent {
  @ViewChild('entryBusiness', { read: ViewContainerRef }) entryBusinessRef: ViewContainerRef;

  step: number;
  type = this.activatedRoute.snapshot.data.type;

  onboardingUtilsService = this.injector.get(OnboardingUtilsService);

  init() {
    this.initEntryLogo();
    this.checkIsSocial();

    this.registrationService.registrationStep$.pipe(
      tap((step) => {
        this.step = step;
        this.type === AccountType.business && step === 2 && this.lazyLoadEntryBusiness();
        this.changeDetectorRef.detectChanges();
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  gotToLogin(): void {
    const { industry, plugin } = this.activatedRoute.snapshot.params;
    const queryParams = this.activatedRoute.snapshot.queryParams;
    this.router.navigate(['login', industry, plugin], { queryParams });
  }

  navigateAfterSocial(): void {
    const { industry, plugin } = this.activatedRoute.snapshot.params;
    const queryParams = this.activatedRoute.snapshot.queryParams;
    this.router.navigate(['registration', industry, plugin, 'social'], { queryParams });
  }

  checkIsSocial(): void {
    const { isSocial } = this.activatedRoute.snapshot.data;

    if (isSocial) {
      this.registrationService.registrationStep$.next(2);
    }
  }

  protected initEntryLogo(): void {
    this.entryLogo = entryLogo;
  }
}
