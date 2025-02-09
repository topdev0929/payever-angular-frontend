import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  Injector,
  Input,
  OnChanges,
  HostBinding,
} from '@angular/core';

import { DetailInterface } from '@pe/checkout/types';

import { UIBaseComponent } from '../base.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'finexp-ui-selected-rate-details-line',
  templateUrl: './selected-rate-details-line.component.html',
  styleUrls: ['./selected-rate-details-line.component.scss'],
})
export class UISelectedRateDetailsLineComponent extends UIBaseComponent implements OnChanges {

  @Input() details: DetailInterface[] = [];

  @HostBinding('style.color') regularTextColor: string = null;

  protected debugName = 'UISelectedRateDetailsLineComponent';

  constructor(injector: Injector, protected element: ElementRef) {
    super(injector);
  }

  ngOnChanges(): void {
    super.ngOnChanges();
  }

  onUpdateStyles(): void {
    this.regularTextColor = this.currentStyles?.regularTextColor || this.default.styles.regularTextColor;
  }
}
