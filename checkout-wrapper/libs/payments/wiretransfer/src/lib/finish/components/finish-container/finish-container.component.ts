import {
  Component,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';

import { AbstractFinishContainerComponent } from '@pe/checkout/finish';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wiretransfer-finish-container',
  templateUrl: './finish-container.component.html',
  styleUrls: ['./finish-container.component.scss'],
})
export class FinishContainerComponent extends AbstractFinishContainerComponent {
  @Input() asSinglePayment = false;
}
