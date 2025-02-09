import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReplaySubject, Subject } from 'rxjs';

import { TranslateService } from '@pe/ng-kit/modules/i18n';

import { DetailInterface, ActionType } from '../../../../shared';
import { DetailService } from '../../../services';

@Component({
  selector: 'or-action-credit-answer',
  templateUrl: 'credit-answer.component.html',
  styleUrls: ['./credit-answer.component.scss']
})
export class ActionCreditAnswerComponent implements OnDestroy, OnInit {

  modalButtons: any[] = [{
    title: this.translateService.translate('details.credit_answer.print'),
    onClick: () => this.onSubmit()
  }];

  currencySymbol: string = '';
  error: string = null;
  order: DetailInterface = {} as any;
  creditAnswerText: string;

  close$: Subject<void> = new Subject<void>();

  private action: ActionType = null;
  private orderId: string;
  private businessUuid: string;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private activatedRoute: ActivatedRoute,
    private detailService: DetailService,
    private translateService: TranslateService
  ) {}

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  ngOnInit(): void {
    this.action = this.activatedRoute.snapshot.data['action'];
    this.orderId = this.activatedRoute.snapshot.params['orderId'];
    this.businessUuid = this.activatedRoute.snapshot.params['uuid'];

    this.getData();
  }

  onSubmit(): void {
    this.print(this.creditAnswerText);
  }

  private getData(): void {
    this.detailService.getData(this.businessUuid, this.orderId).subscribe(
      (order: DetailInterface): void => {
        this.order = order;

        if (this.order.details && this.order.details.credit_answer) {
          this.creditAnswerText = this.nl2br(this.order.details.credit_answer);
        }

        // TODO: need to obtain the proper currencies
        // this.businessService.getBusinessCurrencies(this.settingsService.businessSlug, this.settingsService.settings.apiRestUrlPrefix()).subscribe(
        //   (currencies: BusinessCurrencyInterface[]) => {
        //     this.currencySymbol = currencies.find((currency: BusinessCurrencyInterface) => currency.code === this.order.transaction.currency).symbol;
        //   }
        // );
      }
    );
  }

  private nl2br(text: string): string {
    return text.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br>$2');
  }

  private print(text: string): void {
    const printWindow: Window = window.open('', 'PRINT', 'height=600,width=800');

    printWindow.document.write(`<html><head><title>${this.translateService.translate('details.credit_answer.header')}</title>`);
    printWindow.document.write('</head><body >');
    printWindow.document.write(`<div style="font-family: monospace;">${this.creditAnswerText}</div>`);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

}
