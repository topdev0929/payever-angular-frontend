import { Component, OnInit, inject } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { map, startWith } from 'rxjs/operators';

import { NodeApiService } from '@pe/checkout/api';
import { TopLocationService } from '@pe/checkout/location';
import { FlowState, PaymentState } from '@pe/checkout/store';
import { FlowInterface, NodePaymentResponseInterface } from '@pe/checkout/types';
import { CustomElementService } from '@pe/checkout/utils';

import { SantanderDeFlowService } from '../../../shared/services';

@Component({
  selector: 'santander-de-signature',
  templateUrl: './signature.component.html',
  styleUrls: ['./signature.component.scss'],
})
export class SignatureComponent implements OnInit {
  private store = inject(Store);
  private customElementService = inject(CustomElementService);
  private nodeApiService = inject(NodeApiService);
  private santanderDeFlowService = inject(SantanderDeFlowService);
  private topLocationService = inject(TopLocationService);

  @SelectSnapshot(FlowState.flow) flow!: FlowInterface;

  public successUrl$ = this.nodeApiService.getShopUrls(this.flow).pipe(
    map(shopUrls => shopUrls.successUrl)
  );

  isSigned$ = this.store.select(PaymentState.response).pipe(
    startWith(null as NodePaymentResponseInterface<unknown>),
    map(() => this.santanderDeFlowService.isSigned()),
  );

  public translations = {
    loadingTitle: $localize`:@@santander-de.inquiry.additionalSteps.signature.loading.title:`,
    loadingSubtitle: $localize`:@@santander-de.inquiry.additionalSteps.signature.loading.subtitle:`,
    headerCardTitle: $localize`:@@santander-de.inquiry.additionalSteps.signature.headerCard.title:`,
    headerCardSubtitle: $localize`:@@santander-de.inquiry.additionalSteps.signature.headerCard.subtitle:`,
    descriptionCardTitle: $localize`:@@santander-de.inquiry.additionalSteps.signature.descriptionCard.title:`,
    descriptionCardSubtitle: $localize`:@@santander-de.inquiry.additionalSteps.signature.descriptionCard.subtitle:`,
    actionTitle: $localize`:@@santander-de.inquiry.additionalSteps.signature.action.title:`,
  };

  onClicked(successUrl: string) {
    this.topLocationService.href = successUrl;
  }

  ngOnInit(): void {
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(
      ['register-done-32'],
      null,
      this.customElementService.shadowRoot
    );
  }
}
