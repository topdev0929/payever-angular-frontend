import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Select, Store } from '@ngxs/store';
import { BehaviorSubject, combineLatest, merge, Observable, Subject } from 'rxjs';
import { filter, take, takeUntil, delay, switchMap, tap, map } from 'rxjs/operators';

import { LoaderService } from '@pe/checkout/core/loader';
import { ExternalRedirectStorage } from '@pe/checkout/storage';
import { AuthSelectors, FlowState, GetFlow, GetSettings, SettingsState } from '@pe/checkout/store';
import {
  CheckoutStateParamsInterface,
  FlowInterface,
  CheckoutSettingsInterface,
} from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-pages-show-wrapper',
  templateUrl: 'show-wrapper.component.html',
  providers: [PeDestroyService],
})
export class ShowWrapperComponent {

  @Select(SettingsState.settings) private settings$!: Observable<CheckoutSettingsInterface>;

  @Select(FlowState.flow) private flow$!: Observable<FlowInterface>;

  @SelectSnapshot(AuthSelectors.guestTokenQueryParam)
  private readonly guestTokenQueryParam: Params;

  urlParams$ = new BehaviorSubject<CheckoutStateParamsInterface>(null);

  showLayout$ = combineLatest([
    this.flow$.pipe(filter(Boolean)),
    this.settings$.pipe(filter(Boolean)),
  ]).pipe(
    tap(() => {
      this.loaderService.loaderGlobal = false;
    }),
  );

  private readonly cloneFlowSubject$ = new Subject<string>();
  private cloneFlow$ = this.cloneFlowSubject$.pipe(
    switchMap(flowId => this.externalRedirectStorage.restoreAndClearData(flowId).pipe(
      switchMap(() => this.store.select(FlowState.flow).pipe(
        take(1),
        filter(flow => !flow),
        switchMap(() => this.store.dispatch(new GetFlow(flowId)).pipe(
          map(() => this.store.selectSnapshot(FlowState.flow)),
          switchMap(flow => this.store.dispatch(new GetSettings(
            flow.channelSetId,
            GetSettings.bypassCache,
          )))
        )),
      )),
    )),
    takeUntil(this.destroy$),
  );

  constructor(
    protected destroy$: PeDestroyService,
    private activatedRoute: ActivatedRoute,
    private externalRedirectStorage: ExternalRedirectStorage,
    private router: Router,
    private store: Store,
    private loaderService: LoaderService,
  ) {
    // !!! Please don't move this code to ngOnInit().
    // Sometimes Angular magic happens and ngOnInit() is not triggered for this root component.
    merge(
      this.activatedRoute.params.pipe(
        delay(1),
        tap((params) => {
          if (params.flowId) {
            this.urlParams$.next(this.getCheckoutParamsFromUrl());
            const flowId: string = params.flowId;

            const urlParamsKeys = Object.keys(this.urlParams$.value);
            if (!urlParamsKeys.length ||
              (urlParamsKeys.includes('processed') && this.urlParams$.value.processed === true)) {
              this.initFlowCloneHandler(flowId);
            } else {
              this.router.navigate(['/pay', flowId], {
                queryParamsHandling: '',
                preserveFragment: false,
                replaceUrl: true,
                queryParams: this.guestTokenQueryParam,
              });
            }
          }
        }),
      ),
      this.cloneFlow$,
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  initFlowCloneHandler(flowId: string): void {
    // Have to do restoring here, before first getFlow() request because restored data also can have guest token
    // In this case it works like root route guard
    this.cloneFlowSubject$.next(flowId);
  }

  getCheckoutParamsFromUrl(): CheckoutStateParamsInterface {
    const params: Params = {};
    const urlParams = new URLSearchParams(window.location.search);

    urlParams.forEach((value, key) => {
      if (value !== undefined) {
        params[key] = coerceBooleanProperty(value);
      }
    });

    this.handleModalWindowMode(params);
    this.handleDemoMode(params);

    if (params.showHeader && params.showHeader !== 'false') {
      params.forceNoHeader = false;
    }

    this.cleanupParams(params);

    return this.saveParams(params);
  }

  private handleModalWindowMode(params: Params) {
    const modalWindowMode = params.modalWindowMode;
    if (modalWindowMode !== undefined) {
      params.embeddedMode = coerceBooleanProperty(modalWindowMode);
    }
  }

  private handleDemoMode(params: Params) {
    if (window.location.hash === '#demo') {
      params.setDemo = true;
    }
  }

  private cleanupParams(params: Params) {
    delete params.guest_token;
    delete params.state;
  }

  private saveParams(params: Params): Params {
    if (Object.keys(params).length !== 0) {
      (window as any).peCheckoutParams = params;
    }

    return params;
  }
}
