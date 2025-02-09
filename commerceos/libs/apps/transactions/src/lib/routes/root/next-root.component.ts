import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  OnInit,
  OnDestroy,
  Optional,
  Inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { BusinessInterface } from '@pe/business';
import { AppType, APP_TYPE, PreloaderState } from '@pe/common';
import { DockerItemInterface, DockerState } from '@pe/docker';
import { BusinessState } from '@pe/user';

import { PeTransactionsHeaderService } from '../../services/transactions-header.service';


@Component({
  selector: 'pe-cos-next-root',
  templateUrl: './next-root.component.html',
  styleUrls: [
    './next-root.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TransactionsNextRootComponent implements OnInit, OnDestroy {
  patchedElements: NodeListOf<HTMLElement> = null;
  @SelectSnapshot(DockerState.dockerItems) dockerItems: DockerItemInterface[];
  @SelectSnapshot(BusinessState.businessData) businessData: BusinessInterface;
  @SelectSnapshot(PreloaderState.loading) loading: {};


  constructor(
    public router: Router,
    private transactionsHeaderService: PeTransactionsHeaderService,
    @Optional() @Inject(APP_TYPE) private appType: AppType,
  ) { }

  get isGlobalLoading(): boolean {
    return !this.appType ? false : this.loading[this.appType];
  }

  ngOnInit(): void {
    (window as any).PayeverStatic.IconLoader.loadIcons([
      'apps',
      'set',
      'transactions',
      'new-transactions-cc',
    ]);
    this.transactionsHeaderService.init();
    document.body.classList.add('transactions-app');
  }

  ngOnDestroy(): void {
    this.transactionsHeaderService.destroy();
    document.body.classList.remove('transactions-app');
  }

}
