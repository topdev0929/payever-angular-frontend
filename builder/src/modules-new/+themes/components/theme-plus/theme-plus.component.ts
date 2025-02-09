import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'pe-builder-theme-plus',
  templateUrl: './theme-plus.component.html',
  styleUrls: ['./theme-plus.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemePlusComponent {
  @Input() loading: boolean;

  @Output() create = new EventEmitter<any>();
}
