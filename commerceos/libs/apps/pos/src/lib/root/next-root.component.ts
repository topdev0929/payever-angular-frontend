import { ChangeDetectionStrategy, Component, ViewEncapsulation, OnInit, Inject, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { tap, takeUntil } from 'rxjs/operators';

import { BusinessInterface } from '@pe/business';
import { MessageBus, EnvService, PeDestroyService } from '@pe/common';
import { DockerItemInterface, DockerState } from '@pe/docker';
import { BusinessState } from '@pe/user';

import { PEB_POS_HOST } from '../constants';
import { PosEnvService } from '../services/pos-env.service';
import { PePosHeaderService } from '../services/pos-header.service';


@Component({
  selector: 'cos-next-root',
  templateUrl: './next-root.component.html',
  styleUrls: [
    './next-root.component.scss',
  ],
  providers: [PeDestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class CosNextRootComponent implements OnInit, OnDestroy {
  patchedElements: NodeListOf<HTMLElement> = null;
  @SelectSnapshot(DockerState.dockerItems) dockerItems: DockerItemInterface[];
  @SelectSnapshot(BusinessState.businessData) businessData: BusinessInterface;

  theme: string;

  constructor(
    public router: Router,
    private messageBus: MessageBus,
    private posHeaderService: PePosHeaderService,
    private destroy$: PeDestroyService,
    @Inject(EnvService) private envService: PosEnvService,
    @Inject(PEB_POS_HOST) private pebPosHost: string,
  ) {
    this.envService.businessData = this.businessData;
    this.envService.businessId = this.businessData._id;
  }

  ngOnInit() {
    (window as any).PayeverStatic.IconLoader.loadIcons([
      'set',
      'apps',
      'settings',
    ]);

    this.messageBus.listen('pos.open').pipe(
      tap((terminal: any) => {
        if (terminal?.accessConfig?.internalDomain) {
          window.open(`https://${terminal.accessConfig.internalDomain}.${this.pebPosHost}`);
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.messageBus.listen('pos.navigate.dashboard').pipe(
      tap((posId) => {
        this.router.navigateByUrl(`business/${this.envService.businessId}/pos/${posId}/dashboard`);
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.messageBus.listen('pos.navigate.connect').pipe(
      tap((posId) => {
        this.router.navigateByUrl(`business/${this.envService.businessId}/pos/${posId}/connect`);
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.messageBus.listen('pos.navigate.settings').pipe(
      tap((posId) => {
        this.router.navigateByUrl(`business/${this.envService.businessId}/pos/${posId}/settings`);
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.messageBus.listen('pos.navigate.settings_edit').pipe(
      tap((posId) => {
        this.router.navigate([
          `business/${this.envService.businessId}/pos/${posId}/settings`], { queryParams: { isEdit: true } });
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.posHeaderService.init();
  }

  ngOnDestroy() {
    this.posHeaderService.destroy();
  }
}
