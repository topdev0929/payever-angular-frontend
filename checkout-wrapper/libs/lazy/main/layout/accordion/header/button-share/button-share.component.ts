import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  OnChanges,
  SimpleChanges,
  createNgModule,
} from '@angular/core';
import { from, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { SaveProgressHelperService } from '@pe/checkout/core';
import { ShareBagDialogService } from '@pe/checkout/main/share-bag';
import { PluginEventsService } from '@pe/checkout/plugins';
import { FlowInterface } from '@pe/checkout/types';
import { CustomElementService, PaymentHelperService } from '@pe/checkout/utils';


@Component({
  selector: 'button-share',
  template: `
  <ui-button
    skin="ignore-custom-styles"
    [ngClass]="customStyles ? 'custom-style' : 'default'"
    ariaLabel="Share button"
    [disabled]="isDisabled"
    (click)="shareBag()">
    <svg class="share-icon" width=16 height=16>
      <use xlink:href="#icon-share-34"></use>
    </svg>
  </ui-button>
  `,
  styles: [`
  :host {
    white-space: nowrap;
  }
  .share-text {
    font-size: 12px;
    line-height: 30px;
  }
  .default {
    height: 30px;
  }
  .custom-style {
    font-size: 12px;
    line-height: 36px;
    height: 36px;
  }
  @media (max-width: 380px) {
    .custom-style  {
      padding: 0px 10px;
      font-size: 8px;
      line-height: 30px;
      height: 30px;
    }
  }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonShareComponent implements OnChanges {

  @Input() customStyles: boolean;

  @Input() flow: FlowInterface;


  isDisabled: boolean;

  protected customElementService = this.injector.get(CustomElementService);
  private paymentHelperService = this.injector.get(PaymentHelperService);
  private saveProgressHelperService = this.injector.get(SaveProgressHelperService);
  private cdr = this.injector.get(ChangeDetectorRef);
  private pluginEventsService = this.injector.get(PluginEventsService);


  constructor(
    private injector: Injector,
  ) {
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons([
      'share-34',
    ], null, this.customElementService.shadowRoot);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const flow: FlowInterface = changes.flow?.currentValue;

    if (flow) {

      const paymentOption = flow.connectionId
        && flow.paymentOptions.find(p => p.connections.find(c => c.id === flow.connectionId));

      const isPos = this.paymentHelperService.isPos(flow);

      this.isDisabled = !(isPos
        && (paymentOption
          && 'shareBagEnabled' in paymentOption
          && paymentOption.shareBagEnabled
        || !paymentOption));
      this.cdr.markForCheck();
    }
  }

  shareBag(): void {
    this.saveProgressHelperService.triggerSaving(this.flow.id, (data) => {
      if (!data || !data.flow.amount ) {
        this.pluginEventsService.emitSnackBarToggle(true, $localize `:@@amount.errors.amount:`);

        return;
      }

      this.lazyLoadQrShareModule().pipe(
        tap((service) => {
          service.open(this.flow, data.openNextStep);
        }),
      ).subscribe();
    });
  }

  private lazyLoadQrShareModule(): Observable<ShareBagDialogService> {
    return from(
      import('@pe/checkout/main/share-bag')
        .then(({ ShareBagModule, ShareBagDialogService }) => {
          const module = createNgModule(ShareBagModule, this.injector);
          const service = module.injector.get(ShareBagDialogService);

          return service;
        })
    );
  }
}
