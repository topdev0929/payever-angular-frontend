import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  createNgModule,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { LoaderService } from '@pe/checkout/core/loader';
import type { AmountEditFormComponent as RealAmountEditFormComponent } from '@pe/checkout/sections/amount-edit';
import { OpenNextStep } from '@pe/checkout/store';
import { FlowInterface } from '@pe/checkout/types';
import { CurrencySymbolPipe } from '@pe/checkout/utils';
import { PeDestroyService } from '@pe/destroy';

import { AbstractSelectorComponent } from '../abstract';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CurrencySymbolPipe, PeDestroyService],
  selector: 'checkout-main-amount-edit',
  styles: [`
  .wrap {
    min-height: 128px;
  }
  `],
  templateUrl: 'amount-edit.component.html',
})
export class AmountEditComponent extends AbstractSelectorComponent {

  @Input() submitText: string = null;
  @Output() submitSuccess: EventEmitter<FlowInterface> = new EventEmitter();

  private instance: RealAmountEditFormComponent = null;
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
    this.initInputsOutputs();
  }

  protected initInputsOutputs(): void {
    if (this.instance) {
      this.instance.submitText = this.submitText;

      this.subs?.forEach(s => s?.unsubscribe());
      this.subs = [
        this.instance.submitSuccess.pipe(
          takeUntil(this.destroy$),
        ).subscribe(value => this.submitSuccess.next(value)),
        this.instance.globalLoading.pipe(
          takeUntil(this.destroy$),
        ).subscribe(value => this.loaderService.loaderGlobal = value),
      ];
    }
  }

  protected loadLazyModuleAndComponent(): void {

    import('@pe/checkout/sections/amount-edit').then(({ AmountEditModule }) => {
      // Create a moduleRef, resolve an entry component, create the component
      const moduleRef = createNgModule(AmountEditModule, this.injector);
      const componentType = moduleRef.instance.resolveAmountEditFormComponent();
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
