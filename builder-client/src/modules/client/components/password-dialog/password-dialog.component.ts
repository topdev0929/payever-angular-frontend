import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AuthService } from '@pe/ng-kit/modules/auth';
import { AbbreviationPipe, AbstractComponent } from '@pe/ng-kit/modules/common';
import { EnvironmentConfigService } from '@pe/ng-kit/modules/environment-config';
import { TranslateService } from '@pe/ng-kit/modules/i18n';
import { EnvService } from '../../services/env.service';
import { PasswordControlService } from '../../services/password-control.service';

@Component({
  selector: 'pe-password-dialog',
  templateUrl: 'password-dialog.component.html',
  styleUrls: ['password-dialog.component.scss'],
  })

export class PasswordDialogComponent extends AbstractComponent {
  @Input() logo: any;

  isLoading = false;
  isSubmitter = false;
  message$ = new BehaviorSubject('');
  passwordFormControl = new FormControl('', []);
  domainData = this.envService.domainData;
  live$ = this.envService.isLive$;
  logoLetters: string;
  logoLink = this.configService.getPrimaryConfig().main;
  loginLink = `${this.configService.getFrontendConfig().commerceos}/entry/login`;

  constructor(
    private passwordControlService: PasswordControlService,
    private envService: EnvService,
    private translateService: TranslateService,
    private configService: EnvironmentConfigService,
    private authService: AuthService,
    private abbreviationPipe: AbbreviationPipe,
    private changeDetector: ChangeDetectorRef,
  ) {
    super();

    if (this.domainData && this.domainData.name) {
      this.logoLetters = this.abbreviationPipe.transform(this.domainData.name);
    }

    this.passwordControlService.message$.subscribe(msg => {
      if (!msg.length) {
        this.message$.next(this.translateService.translate('under_construction'));
      }
      else {
        this.message$.next(msg);
        this.message$.complete();
      }
    });
  }

  logoLinkClick(): void {
    // TODO: fix for Mac
    const win = window.open(this.logoLink, '_blank');
    win.focus();
  }

  goToLogin(): void {
    // TODO: fix for Mac
    const win = window.open(this.loginLink, '_blank');
    win.focus();
  }

  onSubmit(): void {
    const password = this.passwordFormControl.value;

    if (!password.length) {
      return;
    }

    this.isLoading = true;

    this.passwordControlService.retrieveToken(this.envService.appId, this.envService.business, password)
      .pipe(
        takeUntil(this.destroyed$),
      )
      .subscribe(data => {

        if (!data) {
          this.passwordFormControl.setErrors({ passwordIncorrect: true });
          this.changeDetector.markForCheck();
        }

        if (data.accessToken) {
          this.authService.setToken(data.accessToken);
          this.passwordControlService.passwordEntered$.next(true);
        }

        this.isLoading = false;
      }, error => {
        this.passwordFormControl.setErrors({ passwordIncorrect: true });
        this.changeDetector.markForCheck();
        this.isLoading = false;
      });
  }
}
