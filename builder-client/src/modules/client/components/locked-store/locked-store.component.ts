import { Component, Input, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Subject } from 'rxjs';

import { EnvironmentConfigService } from '@pe/ng-kit/modules/environment-config';

import { EnvService } from '../../services/env.service';
import { PasswordControlService } from '../../services/password-control.service';


@Component({
  selector: 'pe-locked-store',
  templateUrl: 'locked-store.component.html',
  styleUrls: ['locked-store.component.scss'],
  })

export class LockedStoreComponent implements OnInit {
  @Input() logo: string;
  password = '';
  passwordIncorrect$: Subject<boolean> = new Subject();
  passwordFormControl = new FormControl('', [Validators.required]);
  shopLink = `${this.configService.getFrontendConfig().commerceos}/entry/registration/business/shop`;
  blurBackground = false;
  logoLink = this.configService.getPrimaryConfig().main;

  constructor(
    private passwordControlService: PasswordControlService,
    private envService: EnvService,
    private configService: EnvironmentConfigService,
  ) {
  }

  ngOnInit(): void {
    if (this.envService.loadBackgroundImage) {
      this.blurBackground = true;
    }
  }

  registerDomain(): void {
    const win = window.open(this.shopLink, '_blank');
    win.focus();
  }

  logoLinkClick(): void {
    const win = window.open(this.logoLink, '_blank');
    win.focus();
  }
}
