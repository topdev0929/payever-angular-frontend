import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';

import { PebOptionsState } from '@pe/builder/state';

import { PebControlAnchorType } from './controls';
import { PebControlsService } from './controls.service';


@Component({
  selector: 'peb-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebControlsComponent {

  @Select(PebOptionsState.scale) scale$!: Observable<number>;

  @Input() width = 0;
  @Input() height = 0;
  @Input() ruler = 16;

  type = PebControlAnchorType;

  data$ = this.controlsService.controlsData$;

  constructor(
    private readonly controlsService: PebControlsService,
  ) {
  }
}

