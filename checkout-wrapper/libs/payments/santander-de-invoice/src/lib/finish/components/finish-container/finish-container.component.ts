import { ChangeDetectionStrategy, Component } from '@angular/core';

import {
  AbstractFinishContainer,
  AbstractFinishContainerComponent,
} from '@pe/checkout/finish';


@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-invoice-de-finish-container',
  templateUrl: './finish-container.component.html',
  styleUrls: ['./finish-container.component.scss'],
})
export class FinishContainerComponent
  extends AbstractFinishContainerComponent
  implements AbstractFinishContainer {
}
