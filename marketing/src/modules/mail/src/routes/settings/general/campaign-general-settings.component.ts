import { ChangeDetectionStrategy, Component, InjectionToken, Inject, Optional } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, takeUntil, tap } from 'rxjs/operators';
import { BehaviorSubject, EMPTY, Subject } from 'rxjs';

import { PebEditorApi } from '@pe/builder-api';

import { AbstractComponent } from '../../../misc/abstract.component';
import { PEB_SHOP_HOST } from '../../../constants';

@Component({
  selector: 'peb-campaign-general-settings',
  templateUrl: './campaign-general-settings.component.html',
  styleUrls: ['./campaign-general-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebShopGeneralSettingsComponent extends AbstractComponent {

  shopHost: string;
  shopDeploy = this.activatedRoute.parent.snapshot.data?.shop.accessConfig;
  isLiveSubject$ = new BehaviorSubject<boolean>(this.shopDeploy.isLive);
  isLoadingSubject$ = new Subject<boolean>();

  constructor(
    private activatedRoute: ActivatedRoute,
    @Inject(PEB_SHOP_HOST) private pebShopHost: string,
    private apiService: PebEditorApi,
  ) {
    super();
    this.shopHost = this.pebShopHost;
  }

  onChangeIsLiveStatus(isLive: boolean) {
    this.isLiveSubject$.next(true);
    this.isLoadingSubject$.next(true);

    const body = { ...this.shopDeploy, isLive };
    delete body.id;

    // this.apiService.updateShopDeploy(
    //   this.activatedRoute.parent.snapshot.data.shop.id,
    //   body
    // ).pipe(
    //   catchError(e => {
    //     this.isLiveSubject$.next(false);
    //     this.isLoadingSubject$.next(false);
    //     alert(e.error.message);
    //     return EMPTY;
    //   }),
    //   tap(() => this.isLoadingSubject$.next(true)),
    //   takeUntil(this.destroyed$),
    // ).subscribe();
  }

}
