import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntil, tap } from 'rxjs/operators';

import { ModalButtonListInterface } from '@pe/checkout/finish';
import { PeDestroyService } from '@pe/destroy';

import { AbstractFlowCommonFinishStaticComponent } from '../abstract-flow-common-finish-static.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'flow-santander-de-pos-finish-static-success',
  templateUrl: 'flow-santander-de-pos-finish-static-success.component.html',
  providers: [PeDestroyService],
})
export class FlowSantanderDePosFinishStaticSuccessComponent
  extends AbstractFlowCommonFinishStaticComponent
  implements OnInit {

  orderNumberText = $localize `:@@flow_common_finish.order_number:${this.strongOrderNumber}:orderNumber:`;

  additionalTranslationDomains: string[] = ['payments-options.santander-de-pos-app'];
  buttons: ModalButtonListInterface = {};

  private route: ActivatedRoute = this.injector.get(ActivatedRoute);

  ngOnInit(): void {
    this.route.queryParams.pipe(
      tap((params) => {
        this.buttons = {};
        if (params.terminalLink) {
          this.buttons = {
            submit: {
              title: $localize `:@@payment-santander-de-pos.inquiry.finish.pending.terminalLinkTitle:`,
              classes: 'btn btn-primary btn-link',
              click: () => window.location.href = params.terminalLink,
            },
          };
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }
}
