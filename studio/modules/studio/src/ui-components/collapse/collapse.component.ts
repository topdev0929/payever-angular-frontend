import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'pe-studio-collapse',
  templateUrl: './collapse.component.html',
  styleUrls: ['./collapse.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudioCollapseComponent {
  @Input() isCollapsed = true;
  @Input() title: string;
  constructor() { }

  onCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

}
