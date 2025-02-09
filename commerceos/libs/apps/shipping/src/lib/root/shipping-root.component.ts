import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { merge } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { EnvService, MessageBus, PeDestroyService } from '@pe/common';
import { DockerItemInterface, DockerState } from '@pe/docker';

import { PeShippingHeaderService } from '../services/shipping-header.service';

@Component({
  selector: 'cos-shipping-root',
  templateUrl: './shipping-root.component.html',
  styleUrls: ['./shipping-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    PeDestroyService,
  ],
})
export class CosShippingRootComponent implements OnInit, OnDestroy {

  @SelectSnapshot(DockerState.dockerItems) dockerItems: DockerItemInterface[];

  isSidebarClosed = window.innerWidth <= 720;


  constructor(
    private shippingHeaderService: PeShippingHeaderService,
    public router: Router,
    private messageBus: MessageBus,
    private envService: EnvService,
    private destroy$: PeDestroyService,
  ) {
  }

  ngOnInit(): void {
    this.shippingHeaderService.init();

    const settingCurrencyOpen$ = this.messageBus.listen('setting.currency.open').pipe(
      tap(() => {
        this.router.navigateByUrl(`business/${this.envService.businessId}/settings/details/currency`);
      }),
    );

    const shippingAppToggleSidebar$ = this.messageBus.listen('shipping.app.toggle.sidebar').pipe(
      tap((res) => {
        if (!res) {
          this.messageBus.emit('shipping-app.close.packages.sidebar', true);
        }
        this.shippingHeaderService.onSidebarToggle(res);
      }),
    );

    merge(
      settingCurrencyOpen$,
      shippingAppToggleSidebar$
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.shippingHeaderService.destroy();
    localStorage.removeItem('shipping.profile.grid.layout');
    localStorage.removeItem('shipping.zones.grid.layout');
    localStorage.removeItem('shipping.package.grid.layout');
  }
}
