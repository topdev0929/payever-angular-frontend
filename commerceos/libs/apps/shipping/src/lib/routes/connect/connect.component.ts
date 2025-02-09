import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, map, takeUntil } from 'rxjs/operators';

import { EnvService, NavigationService, PeDestroyService } from '@pe/common';
import { SnackBarService } from '@pe/forms-core';
import { TranslateService } from '@pe/i18n-core';

import { BaseComponent } from '../../misc/base.component';

import { PebShippingConnectService } from './connect.service';


@Component({
  selector: 'peb-connect',
  templateUrl: './connect.component.html',
  styleUrls: ['./connect.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    PeDestroyService,
  ],
})
export class PebConnectComponent extends BaseComponent implements OnInit {
  shippingMethods;

  constructor(
    private shippingConnectService: PebShippingConnectService,
    private envService: EnvService,
    protected translateService: TranslateService,
    private navigationService: NavigationService,
    private router: Router,
    private snackBarService: SnackBarService,
    private destroy$: PeDestroyService,
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
        this.snackBarService.show(
          `Cant get connect from server, reason:\n ${err?.message}`,
        );

        return of(null);
      }),
    );
  }

  onToggle(methodId: string, currentState: boolean) {
    if (currentState) {
      this.shippingConnectService.integrationDisable(methodId).pipe(takeUntil(this.destroy$)).subscribe();
    } else {
      this.shippingConnectService.integrationEnable(methodId).pipe(takeUntil(this.destroy$)).subscribe();
    }
  }

  addConnection() {
    this.navigationService.saveReturn(this.router.url);
    this.router.navigateByUrl(`business/${this.envService.businessId}/connect?integrationName=shippings`);
  }

  openIntegrationConfiguration(integrationName) {
    this.navigationService.saveReturn(this.router.url);
    this.router.navigateByUrl(
      `business/${this.envService.businessId}/connect/shippings/configure/${integrationName}`,
    );
  }
}
