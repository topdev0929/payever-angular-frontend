import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { catchError, map, takeUntil } from 'rxjs/operators';
import { AbstractComponent } from '../../misc/abstract.component';
import { PebShippingConnectService } from './connect.service';
import { AppThemeEnum, EnvService, MessageBus } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { NavigationService } from '@pe/connect-app';
import { Router } from '@angular/router';

@Component({
  selector: 'peb-connect',
  templateUrl: './connect.component.html',
  styleUrls: ['./connect.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PebConnectComponent extends AbstractComponent implements OnInit {
  shippingMethods;
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;
  constructor(
    private shippingConnectService: PebShippingConnectService,
    private envService: EnvService,
    private messageBus: MessageBus,
    protected translateService: TranslateService,
    private navigationService: NavigationService,
    private router: Router,

  ) {
    super(translateService);
  }

  ngOnInit() {
    this.getShippingMethods();
  }

  getShippingMethods() {
    this.shippingMethods = this.shippingConnectService.getShippingMethods().pipe(
      map((data: any) => {
        return data.integrationSubscriptions;
      }),
      catchError((err) => {
        throw new Error(err);
      }),
    );
  }

  onToggle(methodId: string, currentState: boolean) {
    if (currentState) {
      this.shippingConnectService.integrationDisable(methodId).pipe(takeUntil(this.destroyed$)).subscribe();
    } else {
      this.shippingConnectService.integrationEnable(methodId).pipe(takeUntil(this.destroyed$)).subscribe();
    }
  }

  addConnection() {
    this.navigationService.saveReturn(this.router.url);
    this.messageBus.emit('connect.app.open', null);
  }

  openIntegrationConfiguration(integrationName) {
    this.navigationService.saveReturn(this.router.url);
    this.messageBus.emit(`connect.app.integration.configure`, integrationName);
  }
}
