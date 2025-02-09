import { Component, Injector, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { LoaderService } from '@pe/checkout/core/loader';
import { SendToDeviceStorage } from '@pe/checkout/storage';
import { AuthSelectors, InitFlow, ParamsState, SetParams, SetTokens } from '@pe/checkout/store';
import { FlowInterface } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

@Component({
  selector: 'create-flow-from-api-call',
  template: '',
  providers: [PeDestroyService],
})
export class CreateFlowFromApiCallComponent implements OnInit {

  @SelectSnapshot(AuthSelectors.guestTokenQueryParam)
  private readonly guestTokenQueryParam: Params;

  private activatedRoute = this.injector.get(ActivatedRoute);
  private loaderService = this.injector.get(LoaderService);
  private router = this.injector.get(Router);
  private sendToDeviceStorage = this.injector.get(SendToDeviceStorage);
  private zone = this.injector.get(NgZone);
  private store = this.injector.get(Store);
  private destroy$ = this.injector.get(PeDestroyService);

  private forceHidePreviousSteps = this.activatedRoute.snapshot
    .queryParams.forceHidePreviousSteps;

  constructor(private injector: Injector) {}

  ngOnInit(): void {
    const params = this.activatedRoute.snapshot.params;

    const apiCallId = params.apiCallId;

    const creator = (window as any).pe_pageCreateFlowByApiCall;

    const loaderPathname: string = creator?.pathname;
    const loaderPathnameParts = loaderPathname?.split('/').filter(a => a !== '');

    //  TODO: Should be reproduced and discovered why this occurs

    //  Little comment about why we have to check 'creator?.pathname':
    //  It sounds crazy and has no sense but sometimes it's equal to /pay/XXX instead of /pay/api-call/YYYY.
    //  Means that paths are different in loader.js and in current component (must be same!).
    //  It was revealed in APM logs and not possible to reproduce/debug. But happens pretty often.
    //  So it's like we already passed flow creation step and were redirected to /pay/XXX but
    //  suddenly loader.js and current component are triggered again (like on page refresh) and
    //  somehow current component has wrong old url started with /pay/api-call/...

    if (loaderPathnameParts
      && loaderPathnameParts.length === 4
      && loaderPathnameParts[1] === 'pay'
      && loaderPathnameParts[2] === 'api-call'
    ) {
      this.loaderService.loaderGlobal = true;

      if (creator && creator.apiCallId === apiCallId) {
        const flow$: Observable<FlowInterface> = new Observable((obs) => {
          if (creator.flowData) {
            obs.next(creator.flowData);
          } else {
            creator.successCallback = (data: FlowInterface) => {
              this.zone.run(() => {
                obs.next(data);
              });
            };
            creator.errorCallback = (err: any) => {
              this.zone.run(() => {
                const message = `Can't create flow from api call: ${JSON.stringify(err)}`;
                this.router.navigate(['/pay', 'static-finish', 'fail'], { 
                  queryParams: { message },
                });
                this.loaderService.loaderGlobal = false;
              });
            };
          }
        });

        flow$.pipe(
          take(1),
          switchMap(flow => this.setFlow(flow)),
          takeUntil(this.destroy$),
        ).subscribe();
      } else {
        const message = creator.lastError || 'Create flow not triggered in index.html';
        this.router.navigate(['/pay', 'static-finish', 'fail'], { queryParams: { message } });
      }
    }
  }

  private setFlow(flow: FlowInterface): Observable<FlowInterface> {
    const req$ = flow.guestToken
      ? this.store.dispatch(new SetTokens({ accessToken: flow.guestToken }))
      : of(null);

    return req$.pipe(
      switchMap(() => this.store.dispatch(new InitFlow(flow)).pipe(
        tap(() => {
          this.sendToDeviceStorage.setIgnoreGetData(true); // For optimization
          this.router.navigate([
            `/pay/${flow.id}`],
            {
              queryParams: {
                ...this.guestTokenQueryParam,
              },
            });

          if (this.forceHidePreviousSteps) {
            this.store.dispatch(new SetParams({
              ...this.store.selectSnapshot(ParamsState.params),
              forceHidePreviousSteps: true,
            }));
          }
        }),
      )),
    );
  }
}
