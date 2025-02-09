import { Injector, Directive, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { map, shareReplay, takeUntil, tap } from 'rxjs/operators';

import { LoaderService } from '@pe/checkout/core/loader';
import { FlowStorage } from '@pe/checkout/storage';
import { PeDestroyService } from '@pe/destroy';

@Directive()
export abstract class AbstractFlowCommonFinishStaticComponent implements OnInit {

  additionalTranslationDomains: string[] = [];

  private loaderService = this.injector.get(LoaderService);
  protected activatedRoute = this.injector.get(ActivatedRoute);
  protected flowStorage = this.injector.get(FlowStorage);
  protected destroy$ = this.injector.get(PeDestroyService);
  protected readonly strongOrderNumber = `<strong>${this.orderNumber}</strong>`;

  ready$ = this.loaderService.loaderGlobal$.pipe(
    map(a => !a),
    shareReplay(1),
  );

  constructor(protected injector: Injector) {}

  ngOnInit(): void {
    this.activatedRoute.queryParams.pipe(
      tap(() => {
        this.loaderService.loaderGlobal = false;
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  get orderNumber(): string {
    const params: Params = { ...this.activatedRoute.snapshot.queryParams };

    return params.orderNumber || params.order_number || null;
  }
}
