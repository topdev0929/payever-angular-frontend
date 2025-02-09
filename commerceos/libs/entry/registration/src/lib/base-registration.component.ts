import {
  ChangeDetectorRef,
  Compiler,
  Directive,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, takeUntil, tap } from 'rxjs/operators';

import { PeAuthService } from '@pe/auth';
import { PeDestroyService } from '@pe/common';
import { AccountType } from '@pe/entry/personal-form';
import { RegistrationService } from '@pe/shared/registration';



@Directive()
export abstract class BaseRegistrationComponent implements OnInit, OnDestroy {
  @ViewChild('entryBusiness', { read: ViewContainerRef }) entryBusinessRef: ViewContainerRef;

  protected activatedRoute = this.injector.get(ActivatedRoute);
  protected changeDetectorRef = this.injector.get(ChangeDetectorRef);
  protected registrationService = this.injector.get(RegistrationService);
  protected router = this.injector.get(Router);
  protected compiler = this.injector.get(Compiler);
  protected destroyed$ = this.injector.get(PeDestroyService);
  protected authService = this.injector.get(PeAuthService);

  step: number;
  type = this.activatedRoute.snapshot.data.type;

  entryLogo: any;

  abstract init(): void;

  constructor(
    protected injector: Injector,
  ) {
  }

  ngOnInit(): void {
    this.init();
  }

  protected initEntryLogo(): void {
    this.activatedRoute.data.pipe(
      filter(response => !!response.partner),
      tap((response) => {
        this.entryLogo = {
          height: 30,
          icon: response.partner.logo,
          width: 320,
        };
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  protected lazyLoadEntryBusiness(): void {
    import('./business').then(m => m.RegistrationBusinessModule)
      .then(moduleOrFactory => this.compiler.compileModuleAsync(moduleOrFactory))
      .then((moduleFactory) => {
        const moduleRef = moduleFactory.create(this.injector);
        const componentFactory = moduleRef.instance.resolveEntryBusinessComponent();
        const instanceData = this.entryBusinessRef.createComponent(componentFactory, null, moduleRef.injector);
        const instance = instanceData.instance;
        instance.entryLogo = this.entryLogo;

        this.changeDetectorRef.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.registrationService.registrationStep$.next(1);
  }

  gotToLogin(): void {
    const invitationRedirectUrl = this.activatedRoute.snapshot.queryParams.invitationRedirectUrl;
    const queryParams = invitationRedirectUrl ? { queryParams: { invitationRedirectUrl } } : undefined;
    this.router.navigate(['login'], queryParams);
  }

  navigateAfterSocial(type): void {
    const path = type === AccountType.personal
    ? `/personal/${this.authService.getUserData().uuid}/info/overview`
    : '/registration/business/social';
  this.router.navigate([path]);
  }
}
