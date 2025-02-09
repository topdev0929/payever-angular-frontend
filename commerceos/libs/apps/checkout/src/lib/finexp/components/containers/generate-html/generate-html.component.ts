import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { TranslateService } from '@pe/i18n';

import { CheckoutModalActionsInterface } from '../../../shared/modal/types/navbar-controls.type';

@Component({
  selector: 'checkout-generate-html',
  templateUrl: './generate-html.component.html',
  styleUrls: ['./generate-html.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenerateHtmlComponent {

  @Input() generatedHtml;
  @Output() closeEvent = new EventEmitter();
  @Output() clickedGeneratedBox = new EventEmitter();

  title = this.translationsService.translate('finexp.channels.generateHtml.copy');

  modalActions: CheckoutModalActionsInterface[] = [
    {
      title: this.translationsService.translate('actions.close'),
      active: false,
      color: '#0091df',
      callback: () => this.closeEvent.emit(),
    },
  ];

  copied$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private readonly copiedTextDelay: number = 3000;

  constructor(private translationsService: TranslateService) {
  }

  get formattedCode() {
    const rows = this.generatedHtml.split('\n').filter(row => row.trim());
    rows[0] = rows[0]
      .replaceAll(' class', '\n  class')
      .replaceAll(' data', '\n  data')
      .replaceAll('">', '">\n  ')
      .replaceAll('</', '\n</');

    return rows.join('\n').trim()
      .replaceAll(' <script>', '<script>')
      .replaceAll(' </script>', '</script>')
      .replaceAll(' <div', '<div');
  }

  onCopyClick(): void {
    this.clickedGeneratedBox.emit();
    this.copied$.next(true);
    setTimeout(() => this.copied$.next(false), this.copiedTextDelay);
  }
}
