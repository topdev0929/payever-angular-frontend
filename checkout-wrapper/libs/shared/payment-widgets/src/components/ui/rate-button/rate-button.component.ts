import {
  Component, ChangeDetectionStrategy, Injector, HostListener, Output,
  EventEmitter, Input, ElementRef,
} from '@angular/core';

import { RateInterface } from '@pe/checkout/types';

import { UIBaseComponent } from '../base.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'finexp-ui-rate-button',
  templateUrl: './rate-button.component.html',
  styleUrls: ['./rate-button.component.scss'],
})
export class UIRateButtonComponent extends UIBaseComponent {

  @Input() isLoading = false;
  @Input() error: string = null;
  @Input() rate: RateInterface = null;
  @Input() isShowSelectedRateDetails = true;
  @Input() numColumns = 2;
  @Output('clicked') clickedEmitter: EventEmitter<void> = new EventEmitter();

  mainTextColor: string = null;
  buttonColor: string = null;

  protected debugName = 'UIRateButtonComponent';

  constructor(injector: Injector, protected element: ElementRef) {
    super(injector);
  }

  @HostListener('click', ['$event.target']) onClick(): void {
    this.clickedEmitter.emit();
  }

  onUpdateStyles(): void {
    this.mainTextColor = this.currentStyles?.mainTextColor || this.default.styles.mainTextColor;
    this.buttonColor = this.currentStyles?.buttonColor || this.default.styles.buttonColor;
  }
}
