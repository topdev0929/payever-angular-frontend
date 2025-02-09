import { Component, Injector, Input } from '@angular/core';
import { Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { BehaviorSubject, Subject } from 'rxjs';

// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { AppLauncherService, LoaderService } from '@pe/app-launcher';
import { PeAuthService } from '@pe/auth';
import { CosEnvService } from '@pe/base';
import { BusinessInterface } from '@pe/business';
import { AppSetUpStatusEnum, MicroAppInterface, MicroRegistryService } from '@pe/common';
import { PlatformService } from '@pe/platform';
import { BusinessState } from '@pe/user';
import { WelcomeScreenService } from '@pe/welcome-screen';
import { Widget } from '@pe/widgets';

import { WidgetsApiService } from '../services';

@Component({
  template: '',
})
export abstract class AbstractWidgetComponent {

  @Input() widget: Widget;
  @SelectSnapshot(BusinessState.businessData) businessData: BusinessInterface;

  protected readonly destroy$ = new Subject<void>();
  /**
   * Show spinner in button 'Open' (near the 'More' button)
   */
  showButtonSpinner$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /**
   * Show spinner for the whole widget
   */
  showSpinner$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  appUrlPath: string;
  installAppButtonText = '';

  protected appLauncherService: AppLauncherService = this.injector.get(AppLauncherService);
  protected microRegistryService: MicroRegistryService = this.injector.get(MicroRegistryService);

  protected authService: PeAuthService = this.injector.get(PeAuthService);
  protected envService: CosEnvService = this.injector.get(CosEnvService);
  protected router: Router = this.injector.get(Router);
  protected loaderService: LoaderService = this.injector.get(LoaderService);
  protected platformService: PlatformService = this.injector.get(PlatformService);
  protected widgetsApiService: WidgetsApiService = this.injector.get(WidgetsApiService);
  protected welcomeScreen: WelcomeScreenService = this.injector.get(WelcomeScreenService);

  protected abstract appName: string;

  constructor(
    protected injector: Injector
  ) { }

  /**
   * Show button like "Try for free" to install app
   */
  get showInstallButton(): boolean {
    const micro: MicroAppInterface = this.microRegistryService.getMicroConfig(this.appName) as MicroAppInterface;

    return !this.widget.defaultApp && (
      !this.widget.installedApp || this.widget.installedApp && micro && micro.setupStatus !== AppSetUpStatusEnum.Completed
    );
  }

  onOpenButtonClick(): void {
    this.showButtonSpinner$.next(true);
    const micro: MicroAppInterface = this.microRegistryService.getMicroConfig(this.appName) as MicroAppInterface;
    // this.headerService.resetHeader();
    if (micro && micro.setupStatus === AppSetUpStatusEnum.Completed) {
      this.appLauncherService.launchApp(this.appName, this.appUrlPath).subscribe(
        () => {
          this.showButtonSpinner$.next(false);
        },
        () => {
          this.showButtonSpinner$.next(false);
        }
      );
    } else {
      const url = this.envService.isPersonalMode
        ? `personal/${this.authService.getUserData().uuid}/${this.appName}`
        : `business/${this.businessData._id}/${this.appName}`;
      this.router.navigate([url]).catch();
    }
  }
}
