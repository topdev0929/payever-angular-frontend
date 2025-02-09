import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  selector: 'pe-message-overlay',
  templateUrl: 'message-overlay.component.html',
  styleUrls: ['./message-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PeMessageOverlayComponent {
  businessId: string;
}
