import { ChangeDetectionStrategy, Component, Injector, OnInit, ViewEncapsulation } from '@angular/core';

import { AbstractAction } from '../../../../shared/abstractions/action.abstract';

@Component({
  selector: 'pe-credit-answer-action',
  templateUrl: './credit-answer.component.html',
  styleUrls: ['./credit-answer.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ActionCreditAnswerComponent extends AbstractAction implements OnInit {
  creditAnswerText: string;
  printWindow: Window;

  constructor(
    public injector: Injector
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.getData(true);
  }

  print() {
    if (!this.creditAnswerText) {
      this.close();

      return;
    }
    this.printWindow = window.open('', 'PRINT', 'height=600,width=800');

    this.printWindow.document.write(`<html><head><title>
        ${this.translateService.translate('transactions.details.credit_answer.header')}
      </title>`);
      this.printWindow.document.write('</head><body >');
      this.printWindow.document.write(`<div style="font-family: monospace;">${this.creditAnswerText}</div>`);
      this.printWindow.document.write('</body></html>');
      this.printWindow.document.close();
      this.printWindow.focus();
      this.printWindow.print();
  }

  createForm(): void {
    this.makeCreditAnswer();
  }

  override close() {
    super.close();
    this.printWindow?.close();
  }

  private makeCreditAnswer() {
    if (this.order.details?.credit_answer) {
      this.creditAnswerText = this.nl2br(this.order.details.credit_answer);
      this.cdr.detectChanges();
    }
  }

  private nl2br(text: string): string {
    return text.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br>$2');
  }
}
