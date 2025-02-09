import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  Renderer2,
} from '@angular/core';
import { Observable, of } from 'rxjs';
import { take, tap } from 'rxjs/operators';

import { AbstractFinishContainer, AbstractFinishContainerComponent } from '@pe/checkout/finish';
import { ExternalRedirectStorage } from '@pe/checkout/storage';
import { NodePaymentResponseInterface, PaymentStatusEnum } from '@pe/checkout/types';

import { NodePaymentDetailsResponseInterface } from '../../../shared';
import { PAYEX_HOST_VIEW } from '../../constant';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'swedbank-finish-container',
  templateUrl: './finish-container.component.html',
  styles: [':host { display: block; }'],
})
export class FinishContainerComponent
  extends AbstractFinishContainerComponent<NodePaymentDetailsResponseInterface>
  implements AbstractFinishContainer, OnInit {

  private externalRedirectStorage = this.injector.get(ExternalRedirectStorage);
  private renderer = this.injector.get(Renderer2);

  swedbankRunning: boolean;

  protected showFinishModalFromExistingPayment(): void {
    this.paymentResponse = this.nodeFlowService.getFinalResponse();

    if (this.paymentResponse.payment.status === PaymentStatusEnum.STATUS_NEW
      && !this.activatedRoute.snapshot.queryParams.processed
    ) {
      this.initScript(this.paymentResponse);
    } else {
      this.nodeFlowService.updatePayment<NodePaymentDetailsResponseInterface>().subscribe((payment) => {
        this.paymentResponse = payment;
        this.cdr.markForCheck();
      }, (err) => {
        this.errorMessage = err.message || 'Unknown error';
        this.cdr.markForCheck();
      });
    }
  }

  protected paymentCallback(): Observable<unknown> {
    this.paymentResponse && this.initScript(this.paymentResponse);

    return of(null);
  }

  private initScript(paymentResponse: NodePaymentResponseInterface<NodePaymentDetailsResponseInterface>): void {
    const scriptSrc = paymentResponse.paymentDetails.scriptUrl;

    if (document.querySelector(`script[src="${scriptSrc}"]`) && (window as any).payex) {
      setTimeout(() => {
        this.initEvents();
      });
    } else {
      const script: HTMLScriptElement = document.createElement('script');
      this.renderer.setAttribute(script, 'src', paymentResponse.paymentDetails.scriptUrl);
      this.renderer.setAttribute(script, 'type', 'text/javascript');
      this.renderer.setAttribute(script, 'id', 'payment-page-script');
      this.renderer.setAttribute(script, 'async', 'true');
      script.onload = () => {
        this.initEvents();
      };
      document.getElementsByTagName('head')[0].appendChild(script);
    }
  }

  private initEvents(): void {
    this.externalRedirectStorage.saveDataBeforeRedirect(this.flow).pipe(
      take(1),
      tap(() => {
        this.swedbankRunning = true;
        this.cdr.markForCheck();
        window.requestAnimationFrame(() => {
          (window as any).payex.hostedView[PAYEX_HOST_VIEW[this.paymentMethod]]({
            container: 'swedbank-pay-seamless-view-page',
          }).open();
          this.renderer.setStyle(document.querySelector('mat-dialog-container'), 'background-color', 'white');
        });
        this.cdr.markForCheck();
      })
    ).subscribe();
  }
}
