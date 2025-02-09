import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';

@Component({
  selector: 'pe-layout-logo',
  templateUrl: './layout-logo.component.html',
  styleUrls: ['./layout-logo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutLogoKitComponent {
  @Input() url: string;
}
