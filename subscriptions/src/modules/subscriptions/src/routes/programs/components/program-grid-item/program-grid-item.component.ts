import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { PesProgramDto } from '../../dto/program.dto';

@Component({
  selector: 'pe-program-grid-item',
  templateUrl: './program-grid-item.component.html',
  styleUrls: ['./program-grid-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeProgramGridItemComponent {
  @Input() item: PesProgramDto;
}
