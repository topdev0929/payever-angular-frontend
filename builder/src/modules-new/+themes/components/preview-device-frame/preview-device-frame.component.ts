import { animate, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { PebScreen } from '@pe/builder-core';

@Component({
  selector: 'pe-builder-preview-device-frame',
  templateUrl: './preview-device-frame.component.html',
  styleUrls: ['./preview-device-frame.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger(
      'inOutAnimation',
      [
        transition(
          ':enter',
          [
            style({ transform: 'scale(0.75)', opacity: 0 }),
            animate('0.3s ease-out',
                    style({ transform: 'scale(1)', opacity: 1 })),
          ],
        ),
      ],
    ),
  ],
})
export class PreviewDeviceFrameComponent {
  @Input() type: PebScreen;

  PebScreen = PebScreen;
}
