import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'pe-info-box-header',
  templateUrl: 'info-box-header.component.html',
  styleUrls: ['info-box-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoBoxHeaderComponent {

  @Input() title: string;
  @Input() icon: string;
  @Input() hasButton: boolean;
  @Input() isAbsoluteButton: boolean;
  @Output() onButtonClick: EventEmitter<void> = new EventEmitter();

}
