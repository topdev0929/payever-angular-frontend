import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { Store } from '@ngrx/store';

import { combineLatest, Subject } from 'rxjs';
import { tap, takeUntil, filter, take, distinctUntilChanged } from 'rxjs/operators';

import { PlatformService } from '@pe/ng-kit/modules/common';
import { WindowService } from '@pe/ng-kit/src/kit/window';

import { filtersSelector, GlobalStateInterface, transactionsListDataSelector } from '../../../../shared/state-management';

import { ListResponseInterface } from '../../../../shared/interfaces';
import { SettingsService } from '../../../../shared/services';
import { HeaderService } from '../../../../shared/services';

@Component({
  selector: 'or-transactions-list-container',
  templateUrl: 'transactions-list-container.component.html',
  styleUrls: ['transactions-list-container.component.scss']
})
export class TransactionsListContainerComponent implements OnInit, OnDestroy, AfterViewInit {

  appMode: string = 'regular';

  private get businessUuid(): string {
    return this.activatedRoute.snapshot.params.uuid;
  }

  private destroyed$: Subject<void> = new Subject();

  constructor(
    private activatedRoute: ActivatedRoute,
    private headerService: HeaderService,
    private platformService: PlatformService,
    private settingsService: SettingsService,
    private localStorageService: LocalStorageService,
    private store: Store<GlobalStateInterface>,
    private windowService: WindowService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    if (this.activatedRoute.snapshot.queryParams['embedded']) {
      this.appMode = 'embedded';
    }

    if (this.appMode === 'regular') {
      combineLatest(
        this.windowService.isMobile$,
        this.windowService.isIpad$,
        this.windowService.isTablet$,
        this.platformService.microAppReady$.pipe(
          distinctUntilChanged()
        )
      ).pipe(
        takeUntil(this.destroyed$),
        filter(([isMobile, isIpad, isTablet, appName]) => appName === 'transactions')
      ).subscribe(value => {
        const businessId = this.activatedRoute.snapshot.params.uuid;

        this.headerService.setMainHeader(
          !(value[0] || value[1] || value[2]),
          businessId,
          this.router.url.split('/')[1] === 'personal'
        );
      });
    } else if (this.appMode === 'embedded') {
      // We don't set header for this case
    }

    this.platformService.backToDashboard$.pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        // Clear filters on App exit
        this.localStorageService.clear(this.settingsService.getFiltersCacheKey(this.settingsService.businessUuid));
      });

    this.store.select(filtersSelector).pipe(
      takeUntil(this.destroyed$),
      tap((filters) => {
        this.localStorageService.store(this.settingsService.getFiltersCacheKey(this.businessUuid), filters);
      })
    ).subscribe();

    this.store.select(transactionsListDataSelector).pipe(
      filter((data: ListResponseInterface) => !!data),
      take(1)
    )
      .subscribe(() => this.platformService.microAppReady = 'transactions');
    }

  ngAfterViewInit(): void {
    const content: Element
      = document.querySelector('.mat-card-content-scroll-container.data-grid-scroll-container');

    if (content) {
      content['style'].width = '100%';
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
 }

}
