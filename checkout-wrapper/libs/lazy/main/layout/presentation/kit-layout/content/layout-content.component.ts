import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'pe-layout-content',
  templateUrl: 'layout-content.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutContentKitComponent {
  @Input() noPadding: boolean;
  @Input() noScroll: boolean;
  @Input() collapsed = false;
  @Input() showCaution = false;
}
