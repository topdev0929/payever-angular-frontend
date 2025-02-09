import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

import { PeDestroyService } from "@pe/common";


@Component({
  selector: 'peb-item-bar',
  templateUrl: './item-bar.component.html',
  styleUrls: [
    './item-bar.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebItemBarComponent {
  @Input() titles:string[] = [''];
  @Input() description = '';
}
