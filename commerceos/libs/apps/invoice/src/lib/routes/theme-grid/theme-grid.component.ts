import { ChangeDetectionStrategy, Component } from '@angular/core';

import { MessageBus } from '@pe/common';

import { InvoiceEnvService } from '../../services/invoice-env.service';

@Component({
  selector: 'pe-theme-grid',
  templateUrl: './theme-grid.component.html',
  styleUrls: ['./theme-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class PeThemeGridComponent {

  constructor(
    private messageBus: MessageBus,
    private env: InvoiceEnvService,

  ) {
 }

  onThemeInstalled() {
    this.messageBus.emit('invoice.navigate.edit', this.env.invoiceId);
  }
}
