
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { map } from 'rxjs/operators';

import { NodeApiService } from '@pe/checkout/api';
import { TopLocationService } from '@pe/checkout/location';
import { FlowState } from '@pe/checkout/store';
import { FlowInterface } from '@pe/checkout/types';
import { PaymentSpecificStatusEnum } from '@pe/checkout/types';
import { CustomElementService } from '@pe/checkout/utils';

@Component({
  selector: 'finish-sining-status',
  templateUrl: './sining-status.component.html',
  styleUrls: ['./sining-status.component.scss'],
})
export class SiningStatusComponent implements OnInit {
  private customElementService = inject(CustomElementService);
  private nodeApiService = inject(NodeApiService);
  private topLocationService = inject(TopLocationService);

  @SelectSnapshot(FlowState.flow) flow!: FlowInterface;

  @Input() specificStatus: PaymentSpecificStatusEnum;
  @Input() canChangePaymentMethod = false;
  @Output() changePaymentMethod = new EventEmitter<void>();

  public cancelUrl$ = this.nodeApiService.getShopUrls(this.flow).pipe(
    map(shopUrls => this.isDeclined()
      ? shopUrls.failureUrl
      : shopUrls.pendingUrl)
  );

  get translations() {
    return {
      headerCardTitle: this.isDeclined()
        ? $localize`:@@santander-de.inquiry.sining-status.headerCardTitle.declined:`
        : $localize`:@@santander-de.inquiry.sining-status.headerCardTitle.undecided:`,
      descriptionCardTitle: $localize`:@@santander-de.inquiry.sining-status.descriptionCardTitle.undecided:`,
      descriptionCardSubtitle: this.isDeclined()
        ? $localize`:@@santander-de.inquiry.sining-status.descriptionCardSubtitle.declined:`
        : $localize`:@@santander-de.inquiry.sining-status.descriptionCardSubtitle.undecided:`,
      descriptionCardFootnote: $localize`:@@santander-de.inquiry.sining-status.descriptionCardFootnote.declined:`,
    };
  }

  isDeclined() {
    return this.specificStatus === PaymentSpecificStatusEnum.STATUS_ABGELEHNT;
  }

  showChangePaymentMethod() {
    return this.canChangePaymentMethod && this.isDeclined();
  }

  onClicked(cancelUrl: string) {
    this.topLocationService.href = cancelUrl;
  }

  get icon() {
    return `#icon-${this.isDeclined() ? 'error-128' : 'progress-94'}`;
  }

  ngOnInit(): void {
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(
      ['progress-94', 'error-128'],
      null,
      this.customElementService.shadowRoot
    );
  }
}
