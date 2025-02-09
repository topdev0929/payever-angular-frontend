import { Component, ChangeDetectionStrategy, EventEmitter, Input, Output, ChangeDetectorRef } from '@angular/core';

import { ApiService } from '@pe/checkout-sdk/sdk/api';
import { ErrorBag } from '@pe/ng-kit/modules/form';

import { FlowInterface, FlowSettingsInterface } from '@pe/checkout-sdk/sdk/types';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-transaction-cart-edit',
  styleUrls: ['./cart-edit.component.scss'],
  templateUrl: 'cart-edit.component.html',
  providers: [ ErrorBag ]
})
export class CartEditComponent {

  flow: FlowInterface;
  flowSettings: FlowSettingsInterface = null;

  isReady: boolean = false;
  isLoading: boolean = false;

  @Input('flow') set setFlow(flow: FlowInterface) {
    this.flow = flow;
    if (this.flow) {
      this.apiService._getFlowSettings(this.flow.channel_set_id).subscribe(settings => {
        this.flowSettings = settings;
        this.cdr.detectChanges();
      });
    }
  }
  @Output() saved: EventEmitter<FlowInterface> = new EventEmitter<FlowInterface>();
  @Output('isLoading') isSaving: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) {}

  onClose(): void {
    this.isSaving.emit(true);
    this.apiService._getFlow(this.flow.id).subscribe(flow => {
      this.isSaving.emit(false);
      this.saved.emit(flow);
    });
  }

  onServiceReady($event: CustomEvent): void {
    this.isReady = !!$event.detail;
    this.cdr.detectChanges();
  }
}
