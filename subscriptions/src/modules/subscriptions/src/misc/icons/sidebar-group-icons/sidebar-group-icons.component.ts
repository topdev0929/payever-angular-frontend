import { ChangeDetectionStrategy,  Component, Input } from '@angular/core';

@Component({
  selector: 'pe-sidebar-group-icons',
  templateUrl: './sidebar-group-icons.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarGroupIconsComponent {

  @Input() icon = 'group';

  constructor() { }
}
