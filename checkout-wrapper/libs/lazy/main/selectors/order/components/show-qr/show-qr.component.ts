import {
  Component,
  ChangeDetectionStrategy,
  createNgModule,
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


import { LoaderService } from '@pe/checkout/core/loader';
import type { ShowFlowQrComponent } from '@pe/checkout/sections/flow-qr';
import { OpenNextStep } from '@pe/checkout/store';
import { PeDestroyService } from '@pe/destroy';

import { AbstractSelectorComponent } from '../../../abstract';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-main-show-qr',
  templateUrl: 'show-qr.component.html',
  providers: [PeDestroyService],
})
export class ShowQrComponent extends AbstractSelectorComponent {

  embeddedMode$: Observable<boolean>;

  protected i18nDomains: string[] = ['checkout-section-flow-qr'];

  private instance: ShowFlowQrComponent = null;
  private subs: Subscription[] = [];

  private loaderService: LoaderService = this.injector.get(LoaderService);

  onLoading(event: CustomEvent): void {
    this.isLoadingSubject.next(!!event.detail);
  }

  onContinue(): void {
    this.store.dispatch(new OpenNextStep());
  }

  protected initFlow(): void {
    super.initFlow();
    this.embeddedMode$ = this.pickParam$(this.destroy$, d => d.embeddedMode);
    this.initInputsOutputs();
  }

  protected initInputsOutputs(): void {
    if (this.instance) {
      this.subs?.forEach(s => s?.unsubscribe());
      this.subs = [
        this.embeddedMode$.pipe(
          takeUntil(this.destroy$),
        ).subscribe(value => this.instance.embeddedMode = value),
        this.instance.loading.pipe(
          takeUntil(this.destroy$),
        ).subscribe(value => this.isLoadingSubject.next(value)),
        this.instance.globalLoading.pipe(
          takeUntil(this.destroy$),
        ).subscribe(value => this.loaderService.loaderGlobal = value),
      ];
    }
  }

  protected loadLazyModuleAndComponent(): void {

    import('@pe/checkout/sections/flow-qr').then(({ FlowQRModule }) => {
      // Create a moduleRef, resolve an entry component, create the component
      const moduleRef = createNgModule(FlowQRModule, this.injector);
      const componentType = moduleRef.instance.resolveShowFlowQrComponent();
      this.isAllReady$.subscribe(() => {
        const instanceData = this.containerRef.createComponent(componentType, {
          index: 0, 
          injector: moduleRef.injector,
        });

        this.instance = instanceData.instance;
        this.initInputsOutputs();


        this.cdr.detectChanges();
      });
    });
  }
}
