import { CurrencyPipe } from '@angular/common';
import { Component, ChangeDetectionStrategy, EventEmitter, Output, OnInit } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { FlowState } from '@pe/checkout/store';
import { FlowInterface } from '@pe/checkout/types';


@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CurrencyPipe],
  selector: 'checkout-coupons-view-container',
  templateUrl: './coupons-view-container.component.html',
  styleUrls: ['./coupons-view-container.component.scss'],
})
export class CouponsViewContainerComponent implements OnInit {

  @SelectSnapshot(FlowState.flow) public flow: FlowInterface;

  @Output() serviceReady: EventEmitter<boolean> = new EventEmitter();

  ngOnInit(): void {
    this.serviceReady.next(true);
  }
}
